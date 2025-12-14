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
        className="w-full rounded-2xl overflow-hidden relative"
        style={{
          border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
          backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.5),
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th 
                  className="p-4 text-left w-1/4 min-w-[200px]"
                  style={{
                    borderBottom: `1px solid ${withAlpha(theme.primary, 0.1)}`,
                  }}
                >
                  <span 
                    className="text-[10px] font-semibold uppercase tracking-wider opacity-40 block mb-1"
                    style={{ color: theme.headingColor }}
                  >
                    Compare Plans
                  </span>
                  <span 
                    className="text-base font-semibold block"
                    style={{ color: theme.headingColor }}
                  >
                    Features
                  </span>
                </th>
                {columns.map((col, colIndex) => (
                  <th
                    key={colIndex}
                    className="p-4 text-center relative group min-w-[200px]"
                    style={{
                      backgroundColor: col.highlighted
                        ? withAlpha(theme.primary, 0.02)
                        : "transparent",
                      borderBottom: `1px solid ${withAlpha(theme.primary, 0.1)}`,
                      borderLeft: colIndex === 0 ? `1px solid ${withAlpha(theme.primary, 0.05)}` : "none",
                    }}
                  >
                    {col.highlighted && (
                      <div className="absolute top-0 left-0 right-0 py-1 flex justify-center">
                        <span 
                          className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: theme.primary,
                            color: "#ffffff"
                          }}
                        >
                          Popular
                        </span>
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColumn(colIndex);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded-full transition-all z-10"
                      title="Delete Column"
                    >
                      <IconTrash size={14} />
                    </button>

                    <div className="mt-2 space-y-1">
                       <div className="flex justify-center">
                        <ProseMirrorEditor
                          key={`${block.id}-col-name-${colIndex}`}
                          blockId={`${block.id}-col-name-${colIndex}`}
                          value={col.name}
                          onChange={(newContent) =>
                            handleColumnNameChange(colIndex, newContent)
                          }
                          placeholder="Plan Name"
                          className="text-base font-semibold text-center leading-tight"
                        />
                      </div>
                      
                      {col.price && (
                        <div className="flex justify-center items-baseline opacity-80">
                           <ProseMirrorEditor
                            key={`${block.id}-col-price-${colIndex}`}
                            blockId={`${block.id}-col-price-${colIndex}`}
                            value={col.price}
                            onChange={(newContent) =>
                              handleColumnPriceChange(colIndex, newContent)
                            }
                            placeholder="Price"
                            className="text-2xl font-bold tracking-tight text-center"
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
                  className="group/row hover:bg-black/5 transition-colors duration-150"
                >
                  <td 
                    className="p-4 text-left border-b border-dashed"
                    style={{ borderColor: withAlpha(theme.primary, 0.1) }}
                  >
                    <div className="font-medium text-sm" style={{ color: theme.headingColor }}>
                      <ProseMirrorEditor
                        key={`${block.id}-feature-${rowIndex}`}
                        blockId={`${block.id}-feature-${rowIndex}`}
                        value={row.feature}
                        onChange={(newContent) =>
                          handleRowFeatureChange(rowIndex, newContent)
                        }
                        placeholder="Feature"
                        className="w-full"
                      />
                    </div>
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-4 text-center border-b border-dashed relative"
                      style={{
                        backgroundColor: columns[colIndex]?.highlighted
                          ? withAlpha(theme.primary, 0.02)
                          : "transparent",
                         borderColor: withAlpha(theme.primary, 0.1)
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
