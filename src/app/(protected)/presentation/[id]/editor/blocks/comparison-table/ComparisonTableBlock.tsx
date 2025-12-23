import React, { useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import {
  createComparisonTableContent,
  type ComparisonTableContent,
} from "../definitions";
import { IconCheck, IconX, IconTrash, IconPlus } from "@tabler/icons-react";
import { BlockWrapper } from "../../block/BlockWrapper";

interface ComparisonTableBlockProps {
  block: Block;
  onUpdate: (content: ComparisonTableContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const ComparisonTableBlock: React.FC<ComparisonTableBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content =
    (block.content as ComparisonTableContent) ?? createComparisonTableContent();
  const { columns, rows } = content;
  const isDark = theme.themeType === "dark";

  const handleColumnNameChange = useCallback(
    (index: number, newContent: any) => {
      const newColumns = [...columns];
      newColumns[index] = { ...newColumns[index], name: newContent };
      onUpdate({ ...content, columns: newColumns });
    },
    [columns, content, onUpdate]
  );

  const handleColumnPriceChange = useCallback(
    (index: number, newContent: any) => {
      const newColumns = [...columns];
      newColumns[index] = { ...newColumns[index], price: newContent };
      onUpdate({ ...content, columns: newColumns });
    },
    [columns, content, onUpdate]
  );

  const handleRowFeatureChange = useCallback(
    (index: number, newContent: any) => {
      const newRows = [...rows];
      newRows[index] = { ...newRows[index], feature: newContent };
      onUpdate({ ...content, rows: newRows });
    },
    [rows, content, onUpdate]
  );

  const handleValueChange = useCallback(
    (rowIndex: number, colIndex: number, newContent: any) => {
      const newRows = [...rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        values: newRows[rowIndex].values.map((val, i) =>
          i === colIndex ? newContent : val
        ),
      };
      onUpdate({ ...content, rows: newRows });
    },
    [rows, content, onUpdate]
  );

  const renderValue = (
    value: boolean | string | any,
    rowIndex: number,
    colIndex: number
  ) => {
    if (typeof value === "boolean") {
      return (
        <div className="flex justify-center">
          {value ? (
            <IconCheck size={18} style={{ color: theme.primary }} />
          ) : (
            <IconX size={18} className="opacity-20" />
          )}
        </div>
      );
    }

    return (
      <div className="min-h-[1.5rem] flex items-center justify-center">
        <ProseMirrorEditor
          key={`${block.id}-value-${rowIndex}-${colIndex}`}
          blockId={`${block.id}-value-${rowIndex}-${colIndex}`}
          value={
            typeof value === "string"
              ? value
              : typeof value === "object" && value !== null
              ? value
              : ""
          }
          onChange={(newContent) =>
            handleValueChange(rowIndex, colIndex, newContent)
          }
          placeholder="Value"
          className="text-center text-sm"
          theme={theme}
        />
      </div>
    );
  };

  const removeColumn = useCallback(
    (index: number) => {
      if (columns.length <= 1) return;
      const newColumns = columns.filter((_, i) => i !== index);
      const newRows = rows.map((row) => ({
        ...row,
        values: row.values.filter((_, i) => i !== index),
      }));
      onUpdate({ ...content, columns: newColumns, rows: newRows });
    },
    [columns, rows, content, onUpdate]
  );

  const addColumn = useCallback(() => {
    const newColumns = [
      ...columns,
      {
        name: "New Plan",
        price: "$0",
      },
    ];
    const newRows = rows.map((row) => ({
      ...row,
      values: [...row.values, "Value"],
    }));
    onUpdate({ ...content, columns: newColumns, rows: newRows });
  }, [columns, rows, content, onUpdate]);

  const addRow = useCallback(() => {
    const newRows = [
      ...rows,
      {
        feature: "New Feature",
        values: columns.map(() => "Value"),
      },
    ];
    onUpdate({ ...content, rows: newRows });
  }, [rows, columns, content, onUpdate]);

  const customControls = (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addRow();
        }}
        className="p-1.5 rounded-lg transition-all hover:scale-105 flex items-center gap-1"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)",
          color: theme.primary,
        }}
        title="Add Row"
      >
        <IconPlus size={14} stroke={2} />
        <span className="text-[10px] font-medium pr-0.5">Row</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addColumn();
        }}
        className="p-1.5 rounded-lg transition-all hover:scale-105 flex items-center gap-1"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.05)",
          color: theme.primary,
        }}
        title="Add Column"
      >
        <IconPlus size={14} stroke={2} />
        <span className="text-[10px] font-medium pr-0.5">Col</span>
      </button>
    </>
  );

  return (
    <BlockWrapper customControls={customControls} theme={theme}>
      <CommonCard 
        theme={theme} 
        className="w-full overflow-hidden transition-all duration-300 hover:shadow-md"
      >
        <div 
          className="relative p-8 overflow-hidden"
          style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
        >
          {/* Minimal Gradient Background Blob */}
          <div
            className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.03] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
            style={{ backgroundColor: theme.primary }}
          />

          <div className="overflow-x-auto relative z-10">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    className="pb-6 pr-6 text-left w-1/4 min-w-[200px]"
                    style={{
                      borderBottom: `2px solid ${theme.primary}10`,
                    }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 block mb-2"
                      style={{ color: theme.headingColor }}
                    >
                      Compare Plans
                    </span>
                    <span
                      className="text-lg font-bold block tracking-tight"
                      style={{ color: theme.headingColor }}
                    >
                      Features
                    </span>
                  </th>
                  {columns.map((col, colIndex) => (
                    <th
                      key={colIndex}
                      className="p-6 text-center relative group min-w-[180px]"
                      style={{
                        borderBottom: `2px solid ${theme.primary}10`,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeColumn(colIndex);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all hover:bg-red-500/10"
                        style={{ color: "#ef4444" }}
                        title="Delete Column"
                      >
                        <IconTrash size={16} />
                      </button>

                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <ProseMirrorEditor
                            key={`${block.id}-col-name-${colIndex}`}
                            blockId={`${block.id}-col-name-${colIndex}`}
                            value={col.name}
                            onChange={(newContent) =>
                              handleColumnNameChange(colIndex, newContent)
                            }
                            placeholder="Plan Name"
                            className="text-base font-bold text-center tracking-tight"
                            theme={theme}
                          />
                        </div>
                        {col.price && (
                          <div className="flex justify-center">
                            <ProseMirrorEditor
                              key={`${block.id}-col-price-${colIndex}`}
                              blockId={`${block.id}-col-price-${colIndex}`}
                              value={col.price}
                              onChange={(newContent) =>
                                handleColumnPriceChange(colIndex, newContent)
                              }
                              placeholder="Price"
                              className="text-2xl font-black text-center tracking-tighter"
                              theme={theme}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="group/row transition-colors hover:bg-primary/[0.02]"
                  >
                    <td className="py-5 pr-6 text-left">
                      <div
                        className="text-sm font-medium tracking-tight"
                        style={{ color: theme.headingColor }}
                      >
                        <ProseMirrorEditor
                          key={`${block.id}-feature-${rowIndex}`}
                          blockId={`${block.id}-feature-${rowIndex}`}
                          value={row.feature}
                          onChange={(newContent) =>
                            handleRowFeatureChange(rowIndex, newContent)
                          }
                          placeholder="Feature"
                          className="w-full"
                          theme={theme}
                        />
                      </div>
                    </td>
                    {row.values.map((value, colIndex) => (
                      <td key={colIndex} className="py-5 px-6 text-center">
                        <div className="flex justify-center">
                          {typeof value === "boolean" ? (
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm"
                              style={{ 
                                backgroundColor: value ? `${theme.primary}10` : `${theme.primary}05`,
                                borderColor: value ? `${theme.primary}20` : `${theme.primary}05`,
                                opacity: value ? 1 : 0.4
                              }}
                            >
                              {value ? (
                                <IconCheck size={18} strokeWidth={3} style={{ color: theme.primary }} />
                              ) : (
                                <IconX size={16} strokeWidth={2.5} className="opacity-40" />
                              )}
                            </div>
                          ) : (
                            <ProseMirrorEditor
                              key={`${block.id}-value-${rowIndex}-${colIndex}`}
                              blockId={`${block.id}-value-${rowIndex}-${colIndex}`}
                              value={value}
                              onChange={(newContent) =>
                                handleValueChange(rowIndex, colIndex, newContent)
                              }
                              placeholder="Value"
                              className="text-center text-sm font-medium opacity-70"
                              theme={theme}
                            />
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CommonCard>
    </BlockWrapper>
  );
};
