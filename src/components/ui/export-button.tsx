'use client'

import { useState } from 'react'
import { VerificationResult } from '@/hooks/useContractVerification'
import { ReportExporter, ExportOptions } from '@/lib/report-export'
import { Download, FileText, Table, Printer, Settings } from 'lucide-react'

interface ExportButtonProps {
  result: VerificationResult
}

export function ExportButton({ result }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeSourceCode: true,
    includeBytecode: false,
    includeFullABI: true,
  })

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    const options = { ...exportOptions, format }

    switch (format) {
      case 'json':
        ReportExporter.exportAsJSON(result, options)
        break
      case 'csv':
        ReportExporter.exportAsCSV(result)
        break
      case 'pdf':
        ReportExporter.exportAsPDF(result)
        break
    }

    setShowMenu(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Export Report</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Export Format</span>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {showOptions && (
              <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Include in Export</h4>
                <div className="space-y-2">
                  <label className="flex items-center text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSourceCode}
                      onChange={e =>
                        setExportOptions(prev => ({ ...prev, includeSourceCode: e.target.checked }))
                      }
                      className="mr-2 rounded"
                    />
                    Source Code
                  </label>
                  <label className="flex items-center text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeBytecode}
                      onChange={e =>
                        setExportOptions(prev => ({ ...prev, includeBytecode: e.target.checked }))
                      }
                      className="mr-2 rounded"
                    />
                    Bytecode
                  </label>
                  <label className="flex items-center text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeFullABI}
                      onChange={e =>
                        setExportOptions(prev => ({ ...prev, includeFullABI: e.target.checked }))
                      }
                      className="mr-2 rounded"
                    />
                    Full ABI
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => handleExport('json')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-medium">JSON Report</div>
                  <div className="text-xs text-gray-400">Detailed machine-readable format</div>
                </div>
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                <Table className="w-4 h-4 text-green-400" />
                <div>
                  <div className="font-medium">CSV Export</div>
                  <div className="text-xs text-gray-400">Spreadsheet compatible format</div>
                </div>
              </button>

              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                <Printer className="w-4 h-4 text-red-400" />
                <div>
                  <div className="font-medium">PDF Report</div>
                  <div className="text-xs text-gray-400">Print-ready document (HTML)</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
