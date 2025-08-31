import { useState, useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AIElements, useModelInference } from '@ai-elements/react'

interface DataTableProps<TData> {
  data: TData[]
  columns: any[]
  onRowsChange?: (rows: TData[]) => void
  aiEnabled?: boolean
}

const columnHelper = createColumnHelper<any>()

interface SortableRowProps {
  row: any
  children: React.ReactNode
}

const SortableRow = ({ row, children }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
  } = useSortable({ id: row.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-move"
    >
      {children}
    </tr>
  )
}

export function DataTable<TData>({
  data: initialData,
  columns,
  onRowsChange,
  aiEnabled = false,
}: DataTableProps<TData>) {
  const [data, setData] = useState(initialData)
  const [columnFilters, setColumnFilters] = useState<any[]>([])

  const { runInference } = useModelInference({
    modelId: 'SmolLM2-360M',
    temperature: 0.7,
  })

  const defaultColumns = useMemo(
    () => [
      columnHelper.display({
        id: 'dragHandle',
        cell: () => '⋮⋮',
        size: 40,
      }),
      ...columns,
      ...(aiEnabled
        ? [
            columnHelper.display({
              id: 'aiActions',
              header: 'AI Actions',
              cell: ({ row }) => (
                <AIElements.Button
                  onClick={() =>
                    runInference({
                      prompt: `Analyze: ${JSON.stringify(row.original)}`,
                      onResult: (result) => {
                        console.log('AI Analysis:', result)
                      },
                    })
                  }
                >
                  Analyze
                </AIElements.Button>
              ),
            }),
          ]
        : []),
    ],
    [columns, aiEnabled]
  )

  const table = useReactTable({
    data,
    columns: defaultColumns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item: any) => item.id === active.id)
      const newIndex = data.findIndex((item: any) => item.id === over.id)

      const newData = [...data]
      const [movedItem] = newData.splice(oldIndex, 1)
      newData.splice(newIndex, 0, movedItem)

      setData(newData)
      onRowsChange?.(newData)
    }
  }

  return (
    <div className="rounded-md border dark:border-gray-700">
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b dark:border-gray-700">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanFilter() && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={header.column.getFilterValue() as string ?? ''}
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            className="w-full rounded-md border px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
                            placeholder={`Filter ${
                              header.column.columnDef.header as string
                            }`}
                          />
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <SortableContext
                items={table.getRowModel().rows}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <SortableRow key={row.id} row={row}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-t px-4 py-2 text-sm dark:border-gray-700"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </SortableRow>
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded border dark:border-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  )
}
