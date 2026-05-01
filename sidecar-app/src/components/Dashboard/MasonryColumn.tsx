import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React from 'react';

interface MasonryColumnProps {
  id: string;
  items: string[];
  children: React.ReactNode;
}

export default function MasonryColumn({ id, items, children }: MasonryColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} className="flex flex-col flex-1 min-w-[300px]">
        {children}
      </div>
    </SortableContext>
  );
}
