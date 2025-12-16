"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentSuccessProps {
  subscriptionId: string;
  value: number;
  nextDueDate?: string;
  paymentId?: string;
  status?: string;
}

export function PaymentSuccess({
  subscriptionId,
  value,
  nextDueDate,
  paymentId,
  status,
}: PaymentSuccessProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Assinatura Criada com Sucesso</CardTitle>
            <p className="text-muted-foreground mt-2">
              Sua assinatura foi criada e o primeiro pagamento foi processado
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ID da Assinatura</span>
                <span className="font-mono text-sm font-medium">{subscriptionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor Mensal</span>
                <span className="font-semibold text-lg">{formatCurrency(value)}</span>
              </div>
              {nextDueDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Próxima Cobrança</span>
                  <span className="font-medium">
                    {new Date(nextDueDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
              {paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ID do Pagamento</span>
                  <span className="font-mono text-sm font-medium">{paymentId}</span>
                </div>
              )}
              {status && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{status.toLowerCase()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

