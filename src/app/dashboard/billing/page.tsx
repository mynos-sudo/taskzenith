"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const invoices = [
    {
        invoice: "INV001",
        paymentStatus: "Paid",
        totalAmount: "$250.00",
        paymentMethod: "Credit Card",
        date: "2023-10-25"
    },
    {
        invoice: "INV002",
        paymentStatus: "Pending",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
        date: "2023-11-25"
    },
    {
        invoice: "INV003",
        paymentStatus: "Paid",
        totalAmount: "$350.00",
        paymentMethod: "Credit Card",
        date: "2023-12-25"
    },
]

export default function BillingPage() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold font-headline">Billing</h1>
        <p className="text-muted-foreground">
          Manage your billing information and view your invoices.
        </p>
      </div>
      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>You are currently on the <span className="font-semibold text-primary">Pro Plan</span>.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-2xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <p className="text-xs text-muted-foreground">Billed monthly. Your next payment is on July 1, 2024.</p>
                    </div>
                    <Button onClick={() => toast({ title: "Feature not available", description: "Upgrading plans is not yet implemented." })}>
                        Upgrade Plan
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
                 <Button variant="outline" onClick={() => toast({ title: "Feature not available", description: "Cancelling subscriptions is not yet implemented." })}>
                    Cancel Subscription
                </Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your past invoices and payment details.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                             <TableRow key={invoice.invoice}>
                                <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                <TableCell>{invoice.paymentStatus}</TableCell>
                                <TableCell>{invoice.paymentMethod}</TableCell>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
