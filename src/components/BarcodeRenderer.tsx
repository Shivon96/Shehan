import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 42,
  displayValue = true,
  fontSize = 12,
  margin = 4,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format: format || 'CODE128',
        width,
        height,
        displayValue,
        fontSize,
        textMargin: 2,
        margin,
        background: 'transparent',
        lineColor: '#09090b',
      });
    } catch {
      // If specific format fails (e.g. non-numeric in EAN), fallback to CODE128
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          margin,
          background: 'transparent',
          lineColor: '#09090b',
        });
      } catch (err2) {
        console.warn('Could not render barcode for value:', value, err2);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, margin]);

  return <svg ref={svgRef} className={`max-w-full ${className}`} />;
};
