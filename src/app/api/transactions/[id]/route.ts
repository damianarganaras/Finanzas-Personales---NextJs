import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactionSchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const transaction = await db.transaction.findFirst({
      where: {
        id: resolvedParams.id,
        account: {
          userId: session.user.id,
        },
      },
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
    });

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Transformar la respuesta
    const transformedTransaction = {
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
    };

    return NextResponse.json(transformedTransaction);
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
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

    // Verificar que la transacción existe y pertenece al usuario
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id: resolvedParams.id,
        account: {
          userId: session.user.id,
        },
      },
      include: {
        transactionJournal: true,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transacción no encontrada' },
        { status: 404 }
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

    // Actualizar el journal de transacciones
    await db.transactionJournal.update({
      where: { id: existingTransaction.transactionJournalId },
      data: {
        description,
        date,
      },
    });

    // Eliminar relaciones existentes de categorías y tags
    await Promise.all([
      db.transactionCategory.deleteMany({
        where: { transactionId: resolvedParams.id },
      }),
      db.transactionTag.deleteMany({
        where: { transactionId: resolvedParams.id },
      }),
    ]);

    // Actualizar la transacción
    let updatedAmount = amount;
    if (type === 'withdrawal') {
      updatedAmount = -Math.abs(amount);
    } else if (type === 'deposit') {
      updatedAmount = Math.abs(amount);
    }

    const updatedTransaction = await db.transaction.update({
      where: { id: resolvedParams.id },
      data: {
        amount: updatedAmount,
        description: notes,
      },
    });

    // Recrear relaciones de categorías
    if (categoryIds.length > 0) {
      const categoryRelations = categoryIds.map(categoryId => ({
        transactionId: resolvedParams.id,
        categoryId,
      }));

      await db.transactionCategory.createMany({
        data: categoryRelations,
      });
    }

    // Recrear relaciones de tags
    if (tagIds.length > 0) {
      const tagRelations = tagIds.map(tagId => ({
        transactionId: resolvedParams.id,
        tagId,
      }));

      await db.transactionTag.createMany({
        data: tagRelations,
      });
    }

    // Retornar la transacción actualizada con todas las relaciones
    const completeTransaction = await db.transaction.findUnique({
      where: { id: resolvedParams.id },
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
    });

    return NextResponse.json(completeTransaction);
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que la transacción existe y pertenece al usuario
    const existingTransaction = await db.transaction.findFirst({
      where: {
        id: resolvedParams.id,
        account: {
          userId: session.user.id,
        },
      },
      include: {
        transactionJournal: {
          include: {
            transactions: true,
          },
        },
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar las relaciones many-to-many primero
    await Promise.all([
      db.transactionCategory.deleteMany({
        where: { transactionId: resolvedParams.id },
      }),
      db.transactionTag.deleteMany({
        where: { transactionId: resolvedParams.id },
      }),
    ]);

    // Eliminar la transacción
    await db.transaction.delete({
      where: { id: resolvedParams.id },
    });

    // Si esta era la única transacción en el journal, eliminar el journal también
    const remainingTransactions = existingTransaction.transactionJournal.transactions.filter(
      t => t.id !== resolvedParams.id
    );

    if (remainingTransactions.length === 0) {
      await db.transactionJournal.delete({
        where: { id: existingTransaction.transactionJournalId },
      });
    }

    return NextResponse.json(
      { message: 'Transacción eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
