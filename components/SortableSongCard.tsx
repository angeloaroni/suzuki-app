'use client'

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SongCard from './SongCard';

interface SortableSong {
    id: string
    templateId?: string
    title: string
    imageUrl?: string | null
    completed: boolean
    learnedLeft: boolean
    learnedRight: boolean
    learnedBoth: boolean
    notes?: string | null
    youtubeUrl?: string | null
    audioUrl?: string | null
    progressNotesCount?: number
}

export function SortableSongCard({ song, studentId }: { song: SortableSong, studentId: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: song.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <SongCard studentId={studentId} song={song} dragHandleProps={{...attributes, ...listeners}} />
        </div>
    );
}
