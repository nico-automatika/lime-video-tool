'use client';

import { useState } from 'react';
import { Clip } from '@/types';

interface VideoEditorProps {
  projectId: string;
  clips: Clip[];
}

export default function VideoEditor({ projectId, clips: initialClips }: VideoEditorProps) {
  const [clips, setClips] = useState(initialClips);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          clips,
          options: {
            format: 'mp4',
            removeAudio: false,
            notifySlack: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const { exportId } = await response.json();
      alert(`Export started! ID: ${exportId}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to start export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Clips</h2>
        {clips.length === 0 ? (
          <p className="text-gray-500">No clips added yet</p>
        ) : (
          <div className="space-y-2">
            {clips.map((clip) => (
              <div key={clip.id} className="border rounded p-3">
                <p className="font-medium">{clip.title || `Clip ${clip.order + 1}`}</p>
                <p className="text-sm text-gray-600">
                  {clip.startTime}s - {clip.endTime}s
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleExport}
        disabled={clips.length === 0 || isExporting}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isExporting ? 'Exporting...' : 'Export Video'}
      </button>
    </div>
  );
}

