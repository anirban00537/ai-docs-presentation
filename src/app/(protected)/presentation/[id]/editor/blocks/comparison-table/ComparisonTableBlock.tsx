import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createComparisonTableContent,
  type ComparisonTableContent,
} from "../definitions";
import { withAlpha } from "../utils";
import { IconCheck, IconX } from "@tabler/icons-react";

interface ComparisonTableBlockProps {
  block: Block;
  onUpdate: (content: ComparisonTableContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const ComparisonTableBlock: React.FC<ComparisonTableBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content =
    (block.content as ComparisonTableContent) ?? createComparisonTableContent();
  const { columns, rows } = content;

  const handleColumnNameChange = useCallback(
    (index: number, newContent: any) => {
      const newColumns = [...columns];
      newColumns[index] = {
        ...newColumns[index],
        name: newContent,
      };
      onUpdate({
        ...content,
        columns: newColumns,
      });
    },
    [columns, content, onUpdate]
  );

  const handleColumnPriceChange = useCallback(
    (index: number, newContent: any) => {
      const newColumns = [...columns];
      newColumns[index] = {
        ...newColumns[index],
        price: newContent,
      };
      onUpdate({
        ...content,
        columns: newColumns,
      });
    },
    [columns, content, onUpdate]
  );

  const handleRowFeatureChange = useCallback(
    (index: number, newContent: any) => {
      const newRows = [...rows];
      newRows[index] = {
        ...newRows[index],
        feature: newContent,
      };
      onUpdate({
        ...content,
        rows: newRows,
      });
    },
    [rows, content, onUpdate]
  );

  const renderValue = (value: boolean | string | any, colIndex: number) => {
    if (typeof value === "boolean") {
      return (
        <div className="flex justify-center">
          {value ? (
            <IconCheck className="size-5" style={{ color: theme.primary }} />
          ) : (
            <IconX className="size-5 opacity-30" />
          )}
        </div>
      );
    }
    if (typeof value === "string") {
      return (
        <div className="text-center text-sm" style={{ color: theme.bodyColor }}>
          {value}
        </div>
      );
    }
    return (
      <div className="min-h-[1.5rem]">
        <ProseMirrorEditor
          key={`${block.id}-value-${colIndex}`}
          blockId={`${block.id}-value-${colIndex}`}
          value={value}
          onChange={() => {}}
          placeholder="Value"
          className="text-center text-sm"
        />
      </div>
    );
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
        backdropFilter: "blur(12px)",
        border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
        boxShadow: `0 4px 12px -2px ${withAlpha(theme.primary, 0.05)}`,
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th
                className="p-4 text-left font-semibold"
                style={{
                  color: theme.headingColor,
                  borderBottom: `2px solid ${withAlpha(theme.primary, 0.2)}`,
                }}
              >
                Feature
              </th>
              {columns.map((col, colIndex) => (
                <th
                  key={colIndex}
                  className="p-4 text-center font-semibold relative"
                  style={{
                    backgroundColor: col.highlighted
                      ? withAlpha(theme.primary, 0.1)
                      : "transparent",
                    color: theme.headingColor,
                    borderBottom: `2px solid ${withAlpha(theme.primary, 0.2)}`,
                  }}
                >
                  {col.highlighted && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: theme.primary }}
                    />
                  )}
                  <div className="mb-2">
                    <ProseMirrorEditor
                      key={`${block.id}-col-name-${colIndex}`}
                      blockId={`${block.id}-col-name-${colIndex}`}
                      value={col.name}
                      onChange={(newContent) =>
                        handleColumnNameChange(colIndex, newContent)
                      }
                      placeholder="Plan Name"
                      className="text-center font-semibold"
                    />
                  </div>
                  {col.price && (
                    <div>
                      <ProseMirrorEditor
                        key={`${block.id}-col-price-${colIndex}`}
                        blockId={`${block.id}-col-price-${colIndex}`}
                        value={col.price}
                        onChange={(newContent) =>
                          handleColumnPriceChange(colIndex, newContent)
                        }
                        placeholder="Price"
                        className="text-center text-sm opacity-70"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b"
                style={{
                  borderColor: withAlpha(theme.primary, 0.1),
                }}
              >
                <td className="p-4">
                  <div className="min-h-[1.5rem]">
                    <ProseMirrorEditor
                      key={`${block.id}-feature-${rowIndex}`}
                      blockId={`${block.id}-feature-${rowIndex}`}
                      value={row.feature}
                      onChange={(newContent) =>
                        handleRowFeatureChange(rowIndex, newContent)
                      }
                      placeholder="Feature"
                      className="font-medium"
                    />
                  </div>
                </td>
                {row.values.map((value, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-4 text-center"
                    style={{
                      backgroundColor: columns[colIndex]?.highlighted
                        ? withAlpha(theme.primary, 0.05)
                        : "transparent",
                    }}
                  >
                    {renderValue(value, colIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
