"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalculatorPopoverProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CalculatorPopover({ value, onValueChange }: CalculatorPopoverProps) {
  const [expression, setExpression] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setExpression(value || "");
    }
  }, [isOpen, value]);

  const handleButtonClick = (char: string) => {
    setExpression((prev) => prev + char);
  };

  const calculate = () => {
    try {
      // Basic validation to avoid arbitrary code execution
      if (!/^[0-9+\-*/. ]+$/.test(expression)) {
         return;
      }
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)();
      const formattedResult = Number(result).toFixed(2);
      setExpression(formattedResult);
      onValueChange(formattedResult);
      setIsOpen(false);
    } catch (e) {
      // Invalid expression
    }
  };

  const clear = () => {
    setExpression("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger 
        className="absolute right-0 top-0 bottom-0 bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 rounded-r-lg px-3 flex items-center justify-center text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Calculator className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end" side="bottom">
        <div className="flex flex-col gap-2">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-right font-mono text-lg truncate h-10 flex items-center justify-end">
            {expression || "0"}
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button type="button" variant="outline" onClick={() => clear()} className="col-span-2">C</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("/")}>/</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("*")}>*</Button>
            
            <Button type="button" variant="outline" onClick={() => handleButtonClick("7")}>7</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("8")}>8</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("9")}>9</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("-")}>-</Button>
            
            <Button type="button" variant="outline" onClick={() => handleButtonClick("4")}>4</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("5")}>5</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("6")}>6</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("+")}>+</Button>
            
            <Button type="button" variant="outline" onClick={() => handleButtonClick("1")}>1</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("2")}>2</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick("3")}>3</Button>
            <Button type="button" onClick={calculate} className="row-span-2 h-full bg-blue-600 hover:bg-blue-700 text-white">=</Button>
            
            <Button type="button" variant="outline" onClick={() => handleButtonClick("0")} className="col-span-2">0</Button>
            <Button type="button" variant="outline" onClick={() => handleButtonClick(".")}>.</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
