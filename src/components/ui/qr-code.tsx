"use client"

import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Download, X } from 'lucide-react'

interface QRCodeProps {
  value: string
  size?: number
  title?: string
  description?: string
  includeDownload?: boolean
  fgColor?: string
  bgColor?: string
}

export function QRCode({
  value,
  size = 200,
  title,
  description,
  includeDownload = true,
  fgColor = '#3b82f6',
  bgColor = '#000000'
}: QRCodeProps) {
  const [showModal, setShowModal] = useState(false)

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${value}`)
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = size
    canvas.height = size

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')

      const downloadLink = document.createElement('a')
      downloadLink.download = `buildproof-qr-${Date.now()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <>
      <div className="relative group">
        <div
          className="cursor-pointer border border-blue-500 p-4 inline-block transition-all duration-300 hover:border-blue-400"
          onClick={() => setShowModal(true)}
        >
          <QRCodeSVG
            id={`qr-${value}`}
            value={value}
            size={size}
            level="H"
            fgColor={fgColor}
            bgColor={bgColor}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Click to enlarge</p>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-black border border-blue-500 p-8 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {title && (
              <h3 className="text-xl font-bold text-blue-400 mb-2">{title}</h3>
            )}

            {description && (
              <p className="text-gray-400 text-sm mb-6">{description}</p>
            )}

            <div className="flex flex-col items-center gap-6">
              <div className="border border-blue-500 p-4">
                <QRCodeSVG
                  value={value}
                  size={300}
                  level="H"
                  fgColor={fgColor}
                  bgColor={bgColor}
                />
              </div>

              {includeDownload && (
                <button
                  onClick={downloadQR}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
                >
                  <Download size={20} />
                  Download QR Code
                </button>
              )}

              <div className="w-full border-t border-gray-800 pt-4">
                <p className="text-xs text-gray-500 mb-2">Direct link:</p>
                <div className="bg-gray-900 p-3 border border-gray-800">
                  <p className="text-xs text-gray-400 break-all font-mono">
                    {value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function QRCodeButton({
  value,
  label = 'Show QR Code',
  size = 200
}: {
  value: string
  label?: string
  size?: number
}) {
  const [showQR, setShowQR] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowQR(true)}
        className="px-4 py-2 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors text-sm font-medium"
      >
        {label}
      </button>

      {showQR && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-black border border-blue-500 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-blue-400">QR Code</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="border border-blue-500 p-4">
              <QRCodeSVG
                value={value}
                size={size}
                level="H"
                fgColor="#3b82f6"
                bgColor="#000000"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
