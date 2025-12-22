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
      <CommonCard theme={theme} className="w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  className="p-4 text-left w-1/4 min-w-[180px]"
                  style={{
                    borderBottom: `1px solid ${theme.primary}10`,
                  }}
                >
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider opacity-40 block mb-1"
                    style={{ color: theme.headingColor }}
                  >
                    Compare Plans
                  </span>
                  <span
                    className="text-sm font-semibold block"
                    style={{ color: theme.headingColor }}
                  >
                    Features
                  </span>
                </th>
                {columns.map((col, colIndex) => (
                  <th
                    key={colIndex}
                    className="p-4 text-center relative group min-w-[160px]"
                    style={{
                      borderBottom: `1px solid ${theme.primary}10`,
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColumn(colIndex);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-red-500/10"
                      style={{ color: "#ef4444" }}
                      title="Delete Column"
                    >
                      <IconTrash size={14} />
                    </button>

                    <div className="mt-1 space-y-1">
                      <div className="flex justify-center">
                        <ProseMirrorEditor
                          key={`${block.id}-col-name-${colIndex}`}
                          blockId={`${block.id}-col-name-${colIndex}`}
                          value={col.name}
                          onChange={(newContent) =>
                            handleColumnNameChange(colIndex, newContent)
                          }
                          placeholder="Plan Name"
                          className="text-sm font-semibold text-center"
                          theme={theme}
                        />
                      </div>
                      {col.price && (
                        <div className="flex justify-center opacity-70">
                          <ProseMirrorEditor
                            key={`${block.id}-col-price-${colIndex}`}
                            blockId={`${block.id}-col-price-${colIndex}`}
                            value={col.price}
                            onChange={(newContent) =>
                              handleColumnPriceChange(colIndex, newContent)
                            }
                            placeholder="Price"
                            className="text-xl font-bold text-center"
                            theme={theme}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="group/row transition-colors"
                  style={{
                    backgroundColor:
                      rowIndex % 2 === 1 ? `${theme.primary}03` : "transparent",
                  }}
                >
                  <td
                    className="p-4 text-left"
                    style={{
                      borderBottom: `1px solid ${theme.primary}08`,
                    }}
                  >
                    <div
                      className="text-sm"
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
                    <td
                      key={colIndex}
                      className="p-4 text-center"
                      style={{
                        borderBottom: `1px solid ${theme.primary}08`,
                      }}
                    >
                      {renderValue(value, rowIndex, colIndex)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CommonCard>
    </BlockWrapper>
  );
};
