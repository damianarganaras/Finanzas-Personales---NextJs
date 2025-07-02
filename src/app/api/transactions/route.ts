import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactionSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const accountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtros
    const where: any = {
      account: {
        userId: session.user.id,
      },
    };

    if (type) {
      if (type === 'withdrawal') {
        where.amount = { lt: 0 };
      } else if (type === 'deposit') {
        where.amount = { gt: 0 };
      }
    }

    if (accountId) {
      where.accountId = accountId;
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        account: {
          include: {
            accountType: true,
            currency: true,
          },
        },
        transactionJournal: true,
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Transformar los datos para la respuesta
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      accountId: transaction.accountId,
      transactionJournalId: transaction.transactionJournalId,
      amount: Number(transaction.amount),
      description: transaction.description,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      account: {
        id: transaction.account.id,
        name: transaction.account.name,
        accountType: {
          type: transaction.account.accountType.type,
        },
      },
      transactionJournal: {
        id: transaction.transactionJournal.id,
        description: transaction.transactionJournal.description,
        date: transaction.transactionJournal.date,
        userId: transaction.transactionJournal.userId,
      },
      categories: transaction.categories.map(tc => ({
        id: tc.category.id,
        name: tc.category.name,
        userId: tc.category.userId,
      })),
      tags: transaction.tags.map(tt => ({
        id: tt.tag.id,
        name: tt.tag.name,
        userId: tt.tag.userId,
      })),
    }));

    return NextResponse.json(transformedTransactions);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = transactionSchema.safeParse({
      ...body,
      date: new Date(body.date),
    });

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Datos inválidos',
          errors: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { 
      type, 
      description, 
      amount, 
      date, 
      sourceAccountId, 
      destinationAccountId, 
      categoryIds, 
      tagIds, 
      notes 
    } = validation.data;

    // Crear el journal de transacciones
    const transactionJournal = await db.transactionJournal.create({
      data: {
        userId: session.user.id,
        description,
        date,
      },
    });

    let transactions = [];

    if (type === 'withdrawal') {
      // Verificar que la cuenta de origen existe y pertenece al usuario
      const sourceAccount = await db.account.findFirst({
        where: {
          id: sourceAccountId!,
          userId: session.user.id,
        },
      });

      if (!sourceAccount) {
        return NextResponse.json(
          { message: 'Cuenta de origen no válida' },
          { status: 400 }
        );
      }

      // Crear transacción de retiro (monto negativo)
      const transaction = await db.transaction.create({
        data: {
          accountId: sourceAccountId!,
          transactionJournalId: transactionJournal.id,
          amount: -Math.abs(amount),
          description: notes,
        },
      });

      transactions.push(transaction);
    } else if (type === 'deposit') {
      // Verificar que la cuenta de destino existe y pertenece al usuario
      const destinationAccount = await db.account.findFirst({
        where: {
          id: destinationAccountId!,
          userId: session.user.id,
        },
      });

      if (!destinationAccount) {
        return NextResponse.json(
          { message: 'Cuenta de destino no válida' },
          { status: 400 }
        );
      }

      // Crear transacción de depósito (monto positivo)
      const transaction = await db.transaction.create({
        data: {
          accountId: destinationAccountId!,
          transactionJournalId: transactionJournal.id,
          amount: Math.abs(amount),
          description: notes,
        },
      });

      transactions.push(transaction);
    } else if (type === 'transfer') {
      // Verificar ambas cuentas
      const [sourceAccount, destinationAccount] = await Promise.all([
        db.account.findFirst({
          where: {
            id: sourceAccountId!,
            userId: session.user.id,
          },
        }),
        db.account.findFirst({
          where: {
            id: destinationAccountId!,
            userId: session.user.id,
          },
        }),
      ]);

      if (!sourceAccount || !destinationAccount) {
        return NextResponse.json(
          { message: 'Cuentas no válidas para la transferencia' },
          { status: 400 }
        );
      }

      // Crear dos transacciones: una negativa (origen) y una positiva (destino)
      const [withdrawalTransaction, depositTransaction] = await Promise.all([
        db.transaction.create({
          data: {
            accountId: sourceAccountId!,
            transactionJournalId: transactionJournal.id,
            amount: -Math.abs(amount),
            description: notes,
          },
        }),
        db.transaction.create({
          data: {
            accountId: destinationAccountId!,
            transactionJournalId: transactionJournal.id,
            amount: Math.abs(amount),
            description: notes,
          },
        }),
      ]);

      transactions.push(withdrawalTransaction, depositTransaction);
    }

    // Asociar categorías si se proporcionaron
    if (categoryIds.length > 0 && transactions.length > 0) {
      const categoryRelations = [];
      for (const transactionId of transactions.map(t => t.id)) {
        for (const categoryId of categoryIds) {
          categoryRelations.push({
            transactionId,
            categoryId,
          });
        }
      }

      await db.transactionCategory.createMany({
        data: categoryRelations,
      });
    }

    // Asociar tags si se proporcionaron
    if (tagIds.length > 0 && transactions.length > 0) {
      const tagRelations = [];
      for (const transactionId of transactions.map(t => t.id)) {
        for (const tagId of tagIds) {
          tagRelations.push({
            transactionId,
            tagId,
          });
        }
      }

      await db.transactionTag.createMany({
        data: tagRelations,
      });
    }

    // Retornar el journal completo con las transacciones
    const completeTransactionJournal = await db.transactionJournal.findUnique({
      where: { id: transactionJournal.id },
      include: {
        transactions: {
          include: {
            account: {
              include: {
                accountType: true,
                currency: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(completeTransactionJournal, { status: 201 });
  } catch (error) {
    console.error('Error al crear transacción:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
