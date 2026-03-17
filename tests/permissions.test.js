import { describe, expect, it } from 'vitest'
import { applyRLS } from '../src/core/permissions.js'

const rows = [
  { owner: 'Иванов', team: 'Север', amount: 100 },
  { owner: 'Петров', team: 'Юг', amount: 200 },
  { owner: 'Сидоров', team: 'Север', amount: 300 }
]

describe('permissions', () => {
  it('admin видит всё', () => {
    expect(applyRLS(rows, { role: 'admin' })).toHaveLength(3)
  })

  it('manager видит только свои строки', () => {
    expect(applyRLS(rows, { role: 'manager', userName: 'Иванов' })).toHaveLength(1)
  })

  it('teamlead видит только свою команду', () => {
    expect(applyRLS(rows, { role: 'teamlead', teamValue: 'Север' })).toHaveLength(2)
  })

  it('viewer без userName не видит ничего', () => {
    expect(applyRLS(rows, { role: 'viewer' })).toHaveLength(0)
  })

  it('неизвестная роль не видит ничего', () => {
    expect(applyRLS(rows, { role: 'hack' })).toHaveLength(0)
  })
})
