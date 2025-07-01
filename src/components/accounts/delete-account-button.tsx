'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteAccount } from '@/hooks/use-accounts';
import type { Account } from '@/types';

interface DeleteAccountButtonProps {
  account: Account;
  transactionCount: number;
}

export function DeleteAccountButton({ account, transactionCount }: DeleteAccountButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAccountMutation = useDeleteAccount();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await deleteAccountMutation.mutateAsync(account.id);
      toast.success(`Cuenta "${account.name}" eliminada correctamente`);
      router.push('/accounts');
      router.refresh();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al eliminar la cuenta'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isDisabled = transactionCount > 0;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isDisabled || isDeleting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
          <AlertDialogDescription>
            {isDisabled ? (
              <>
                No se puede eliminar la cuenta <strong>"{account.name}"</strong> porque tiene{' '}
                <strong>{transactionCount}</strong> transacción{transactionCount !== 1 ? 'es' : ''} asociada{transactionCount !== 1 ? 's' : ''}.
                <br /><br />
                Para eliminar esta cuenta, primero debe eliminar o transferir todas las transacciones asociadas.
              </>
            ) : (
              <>
                Esta acción eliminará permanentemente la cuenta <strong>"{account.name}"</strong>.
                Esta acción no se puede deshacer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {!isDisabled && (
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
