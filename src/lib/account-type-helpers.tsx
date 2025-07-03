/**
 * Componentes helper para tipos de cuenta
 * Este archivo contiene funciones que retornan JSX
 */

import { getAccountTypeIconComponent } from './account-types';

/**
 * Obtiene el icono JSX para un tipo de cuenta
 */
export function getAccountTypeIcon(type: string, props?: React.ComponentProps<'svg'>) {
  const IconComponent = getAccountTypeIconComponent(type);
  return <IconComponent className="h-5 w-5" {...props} />;
}
