import { Badge } from "@/components/Badge";
import { Table, TableHead, TableHeaderCell, TableRow, TableCell } from "@/components/Table";
import { formatDayMonthYear } from "@/lib/booking/present";
import { DownloadInvoiceButton } from "./DownloadInvoiceButton";

export type InvoiceRow = { transactionId: string; billedAt: string };

// Badge 4d, below the status card — only paid transactions are ever passed
// in, so every row's badge reads PAID.
export function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  if (invoices.length === 0) return null;

  return (
    <div>
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Invoices</TableHeaderCell>
            <TableHeaderCell />
            <TableHeaderCell className="text-right normal-case tracking-normal text-tinta-600">
              From Paddle
            </TableHeaderCell>
          </tr>
        </TableHead>
        <tbody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.transactionId}>
              <TableCell className="whitespace-nowrap font-mono text-[12.5px] font-medium text-tinta">
                {formatDayMonthYear(new Date(invoice.billedAt))}
              </TableCell>
              <TableCell>
                <Badge tone="confirmed">Paid</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DownloadInvoiceButton transactionId={invoice.transactionId} />
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
