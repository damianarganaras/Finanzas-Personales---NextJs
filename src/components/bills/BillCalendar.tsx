'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Receipt } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface BillCalendarProps {
  bills: any[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bills: any[];
}

export function BillCalendar({ bills }: BillCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Generar los días del mes
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Incluir días de la semana anterior y siguiente para completar el calendario
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
  
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Mapear facturas a días
  const getDayData = (date: Date): CalendarDay => {
    const dayBills = bills.filter(bill => {
      const dueDate = new Date(bill.nextDueDate);
      return isSameDay(dueDate, date);
    });

    return {
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      bills: dayBills
    };
  };

  const calendarData = calendarDays.map(getDayData);

  const getBillStatus = (bill: any) => {
    const dueDate = new Date(bill.nextDueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    
    if (!bill.active) return 'inactive';
    if (isOverdue) return 'overdue';
    return 'active';
  };

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-blue-500';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendario */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Headers de días de la semana */}
              {weekDays.map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              
              {/* Días del calendario */}
              {calendarData.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    p-2 text-sm relative border rounded-md transition-colors
                    ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                    ${day.isToday ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}
                    ${selectedDay?.date.getTime() === day.date.getTime() ? 'bg-blue-200' : ''}
                    hover:bg-gray-50
                  `}
                >
                  <div className="font-medium">
                    {format(day.date, 'd')}
                  </div>
                  
                  {/* Indicadores de facturas */}
                  {day.bills.length > 0 && (
                    <div className="flex gap-1 mt-1 justify-center">
                      {day.bills.slice(0, 3).map((bill, billIndex) => (
                        <div
                          key={billIndex}
                          className={`w-2 h-2 rounded-full ${getBillStatusColor(getBillStatus(bill))}`}
                          title={bill.name}
                        />
                      ))}
                      {day.bills.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.bills.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel lateral con detalles */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDay ? (
                <>
                  Facturas del {format(selectedDay.date, 'd MMMM', { locale: es })}
                </>
              ) : (
                'Selecciona un día'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDay ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                <p>Haz clic en un día del calendario para ver las facturas</p>
              </div>
            ) : selectedDay.bills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto mb-2" />
                <p>No hay facturas para este día</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDay.bills.map(bill => {
                  const status = getBillStatus(bill);
                  
                  return (
                    <div
                      key={bill.id}
                      className={`p-3 border rounded-lg ${
                        status === 'overdue' ? 'border-red-200 bg-red-50' :
                        status === 'inactive' ? 'border-gray-200 bg-gray-50' :
                        'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{bill.name}</h4>
                          {bill.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {bill.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                status === 'overdue' ? 'destructive' :
                                status === 'inactive' ? 'secondary' :
                                'default'
                              }
                            >
                              {status === 'overdue' && 'Vencida'}
                              {status === 'inactive' && 'Inactiva'}
                              {status === 'active' && 'Activa'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {bill.frequency === 'weekly' && 'Semanal'}
                              {bill.frequency === 'monthly' && 'Mensual'}
                              {bill.frequency === 'quarterly' && 'Trimestral'}
                              {bill.frequency === 'annually' && 'Anual'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${Number(bill.amount).toFixed(2)}
                          </div>
                          {bill.autoPayEnabled && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Auto-pago
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen del mes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumen del mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const monthBills = bills.filter(bill => {
                  const dueDate = new Date(bill.nextDueDate);
                  return isSameMonth(dueDate, currentDate);
                });
                
                const activeBills = monthBills.filter(bill => bill.active);
                const totalAmount = activeBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
                const overdueBills = activeBills.filter(bill => {
                  const dueDate = new Date(bill.nextDueDate);
                  return dueDate < new Date();
                });

                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total facturas:</span>
                      <span className="font-medium">{monthBills.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Facturas activas:</span>
                      <span className="font-medium">{activeBills.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monto total:</span>
                      <span className="font-medium">${totalAmount.toFixed(2)}</span>
                    </div>
                    {overdueBills.length > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span className="text-sm">Vencidas:</span>
                        <span className="font-medium">{overdueBills.length}</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
