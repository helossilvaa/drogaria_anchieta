"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CardDashboard({ title, amount, growth, description }) {
  return (
    <Card className="bg-white rounded-lg shadow-md h-52">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <span className="text-4xl font-bold">{amount}</span>
          <div className={`flex items-center px-2 py-1 rounded-md text-sm font-medium ${growth >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {growth >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            <span>{Math.abs(growth)}%</span>
          </div>
        </div>
        <CardDescription className="mt-2 text-gray-500">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
