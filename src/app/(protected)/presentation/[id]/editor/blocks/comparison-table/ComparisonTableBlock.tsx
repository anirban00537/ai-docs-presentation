import React, { useCallback, useMemo } from "react";
import { Plus, Columns, Rows } from "lucide-react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createComparisonTableContent,
  type ComparisonTableContent,
} from "../definitions";
import { withAlpha } from "../utils";
import { IconCheck, IconX, IconTrash, IconPlus } from "@tabler/icons-react";
import { BlockWrapper } from "../BlockWrapper";
import { createParagraphContent } from "../definitions/common";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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


  const handleValueChange = useCallback(
    (rowIndex: number, colIndex: number, newContent: any) => {
      const newRows = [...rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        values: newRows[rowIndex].values.map((val, i) =>
          i === colIndex ? newContent : val
        ),
      };
      onUpdate({
        ...content,
        rows: newRows,
      });
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
            <IconCheck className="size-5" style={{ color: theme.primary }} />
          ) : (
            <IconX className="size-5 opacity-30" />
          )}
        </div>
      );
    }
    
    // Treat string values as simple text or wrap them in ProseMirror if we want them editable.
    // For this request, we want "use prosemirror component to show text and can be edited".
    // So we assume the value passed to ProseMirrorEditor is compatible or will be handled.
    // Ideally, we should initialize new rows with ProseMirror docs.
    
    return (
      <div className="min-h-[1.5rem] flex items-center justify-center">
        <ProseMirrorEditor
          key={`${block.id}-value-${rowIndex}-${colIndex}`}
          blockId={`${block.id}-value-${rowIndex}-${colIndex}`}
          value={typeof value === 'string' ? createParagraphContent(value) : value} // Ensure specific value type for editor
          onChange={(newContent) => handleValueChange(rowIndex, colIndex, newContent)}
          placeholder="Value"
          className="text-center text-sm"
        />
      </div>
    );
  };


  const removeColumn = useCallback(
    (index: number) => {
      if (columns.length <= 1) return; // Prevent deleting the last column

      const newColumns = columns.filter((_, i) => i !== index);
      const newRows = rows.map((row) => ({
        ...row,
        values: row.values.filter((_, i) => i !== index),
      }));

      onUpdate({
        ...content,
        columns: newColumns,
        rows: newRows,
      });
    },
    [columns, rows, content, onUpdate]
  );

  const addColumn = useCallback(() => {
    const newColumns = [
      ...columns,
      {
        name: createParagraphContent("New Plan"),
        price: createParagraphContent("$0"),
        highlighted: false,
      },
    ];

    const newRows = rows.map((row) => ({
      ...row,
      values: [...row.values, createParagraphContent("Value")],
    }));

    onUpdate({
      ...content,
      columns: newColumns,
      rows: newRows,
    });
  }, [columns, rows, content, onUpdate]);

  const addRow = useCallback(() => {
    const newRows = [
      ...rows,
      {
        feature: createParagraphContent("New Feature"),
        values: columns.map(() => createParagraphContent("Value")),
      },
    ];
     onUpdate({
      ...content,
      rows: newRows,
    });
  }, [rows, columns, content, onUpdate]);


  const buttonStyle = theme
    ? {
        backgroundColor: theme.primary,
        color: "#ffffff",
        border: "none",
      }
    : {};

  const customControls = (
    <>
      <Button
        variant={theme ? "default" : "secondary"}
        size="sm"
        className={cn(
          "shadow-lg backdrop-blur-md transition-all transform hover:scale-105 px-3",
          !theme && "bg-background/80 hover:bg-background border"
        )}
        style={buttonStyle}
        onClick={(e) => {
          e.stopPropagation();
          addRow();
        }}
      >
        <Rows className="w-4 h-4 mr-2" />
        Add Row
      </Button>
      <Button
        variant={theme ? "default" : "secondary"}
        size="sm"
        className={cn(
          "shadow-lg backdrop-blur-md transition-all transform hover:scale-105 px-3",
          !theme && "bg-background/80 hover:bg-background border"
        )}
        style={buttonStyle}
        onClick={(e) => {
          e.stopPropagation();
          addColumn();
        }}
      >
        <Columns className="w-4 h-4 mr-2" />
        Add Column
      </Button>
    </>
  );

  return (
    <BlockWrapper customControls={customControls} theme={theme}>
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
                    className="p-4 text-center font-semibold relative group"
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
                     <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColumn(colIndex);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-md text-red-500 transition-all transform hover:scale-110"
                      title="Delete Column"
                    >
                      <IconTrash size={14} />
                    </button>
                    <div className="mb-2 pt-2">
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
                      {renderValue(value, rowIndex, colIndex)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BlockWrapper>
  );
};
