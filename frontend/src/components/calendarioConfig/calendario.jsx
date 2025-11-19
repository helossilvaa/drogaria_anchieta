import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";

export function CalendarioConfig({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [month, setMonth] = useState(new Date());

  
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split("-");
      const date = new Date(year, month - 1, day); 
  
      setSelected(date);
      setMonth(date);
    } else {
      setSelected(null);
      setMonth(new Date());
    }
  }, [value]);
  

  const handleSelect = (date) => {
    if (!date) return;
    setSelected(date);
    setMonth(date);
    if (onChange) {
      const isoDate = date.toISOString().split("T")[0];
      onChange(isoDate);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
        >
          {selected
            ? selected.toLocaleDateString("pt-BR")
            : "Selecione a data"}
          <CalendarIcon className="w-4 h-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          month={month}        // 👈 define o mês exibido
          onMonthChange={setMonth} // 👈 atualiza quando o usuário muda de mês
        />
      </PopoverContent>
    </Popover>
  );
}
