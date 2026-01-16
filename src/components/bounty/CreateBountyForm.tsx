'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface CreateBountyFormProps {
  onSubmit: (data: {
    title: string
    description: string
    reward: string
    deadline: number
  }) => Promise<void>
  isLoading?: boolean
}

export function CreateBountyForm({ onSubmit, isLoading }: CreateBountyFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reward, setReward] = useState('')
  const [days, setDays] = useState('7')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const deadlineTimestamp = Math.floor(Date.now() / 1000) + parseInt(days) * 24 * 60 * 60

    await onSubmit({
      title,
      description,
      reward,
      deadline: deadlineTimestamp,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setReward('')
    setDays('7')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center gap-2">
          <Plus size={24} className="text-blue-400" />
          Create New Bounty
        </CardTitle>
        <CardDescription className="text-gray-400">
          Post a bounty and reward builders for completing your task
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Bounty Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Build a DeFi Dashboard"
              className="contract-input w-full px-4 py-3 text-white text-base border-gray-800 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what needs to be built..."
              rows={4}
              className="contract-input w-full px-4 py-3 text-white text-base border-gray-800 rounded-lg resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Reward (ETH)</label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={reward}
                onChange={e => setReward(e.target.value)}
                placeholder="0.1"
                className="contract-input w-full px-4 py-3 text-white text-base border-gray-800 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Deadline (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={e => setDays(e.target.value)}
                placeholder="7"
                className="contract-input w-full px-4 py-3 text-white text-base border-gray-800 rounded-lg"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !title || !description || !reward || !days}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Creating...' : 'Create Bounty'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
