"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { Table, TableHead, TableHeaderCell, TableRow, TableCell } from "@/components/Table";
import { formatDayMonthYear, formatDayMonthShort } from "@/lib/booking/present";
import { MemberRowActions } from "./MemberRowActions";
import { cn } from "@/lib/cn";

export type MemberRow = {
  id: string;
  email: string;
  role: "admin" | "member";
  joinedAt: string;
  bookings30d: number;
  isYou: boolean;
};

type RoleFilter = "all" | "admin" | "member";

export function MembersTable({ members }: { members: MemberRow[] }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const counts = useMemo(
    () => ({
      all: members.length,
      admin: members.filter((m) => m.role === "admin").length,
      member: members.filter((m) => m.role === "member").length,
    }),
    [members],
  );

  const filtered = members.filter((member) => {
    if (roleFilter !== "all" && member.role !== roleFilter) return false;
    if (query && !member.email.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          type="search"
          placeholder="Search by email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-[280px]"
        />
        <div className="flex gap-0.5">
          <RoleTab
            label="All"
            count={counts.all}
            active={roleFilter === "all"}
            onClick={() => setRoleFilter("all")}
          />
          <RoleTab
            label="Admins"
            count={counts.admin}
            active={roleFilter === "admin"}
            onClick={() => setRoleFilter("admin")}
          />
          <RoleTab
            label="Members"
            count={counts.member}
            active={roleFilter === "member"}
            onClick={() => setRoleFilter("member")}
          />
        </div>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Member</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Joined</TableHeaderCell>
              <TableHeaderCell>Bookings · 30d</TableHeaderCell>
              <TableHeaderCell />
            </tr>
          </TableHead>
          <tbody>
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <span className="text-[13px] text-tinta">{member.email}</span>
                  {member.isYou && (
                    <span className="ml-1.5 font-mono text-[10px] text-tinta-600">· YOU</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge tone={member.role}>{member.role === "admin" ? "Admin" : "Member"}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-[12.5px] font-medium text-tinta">
                  {formatDayMonthYear(new Date(member.joinedAt))}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-[13px] font-medium",
                    member.bookings30d === 0 ? "text-tinta-600" : "text-tinta",
                  )}
                >
                  {member.bookings30d}
                </TableCell>
                <TableCell className="text-right">
                  {!member.isYou && (
                    <MemberRowActions memberId={member.id} role={member.role} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="flex flex-col divide-y divide-[rgba(42,33,24,0.12)] border border-[rgba(42,33,24,0.2)] bg-white md:hidden">
        {filtered.map((member) => (
          <MobileMemberRow key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

// Role actions aren't in the row on mobile (README 12: "pasan a pulsación
// larga o a una pantalla de detalle — no las metas en la fila") — tapping
// the row instead reveals them below it, rather than a fragile long-press
// gesture or a whole separate route for two buttons.
function MobileMemberRow({ member }: { member: MemberRow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => !member.isYou && setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 p-3.5 text-left"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] text-tinta">
            {member.email}
            {member.isYou && (
              <span className="ml-1.5 font-mono text-[10px] text-tinta-600">· YOU</span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[.05em] text-tinta-600">
            {formatDayMonthShort(new Date(member.joinedAt))} · {member.bookings30d} bookings
          </div>
        </div>
        <Badge tone={member.role} className="flex-none">
          {member.role === "admin" ? "Admin" : "Member"}
        </Badge>
      </button>
      {expanded && !member.isYou && (
        <div className="border-t border-[rgba(42,33,24,0.12)] bg-crema-100 p-3.5">
          <MemberRowActions memberId={member.id} role={member.role} align="start" />
        </div>
      )}
    </div>
  );
}

function RoleTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-[7px] font-heading text-xs font-semibold",
        active
          ? "bg-umbral text-crema"
          : "border border-[rgba(42,33,24,0.28)] bg-white text-tinta",
      )}
    >
      {label} {count}
    </button>
  );
}
