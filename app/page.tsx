import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Checkout Asaas</CardTitle>
          <CardDescription>
            Sistema de checkout completo integrado com Asaas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Acesse a página de checkout para processar pagamentos via Pix ou Cartão de Crédito.
          </p>
          <Link href="/checkout?amount=100.00">
            <Button className="w-full">Ir para Checkout</Button>
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            Você também pode acessar diretamente: /checkout?amount=VALOR
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

