"use client"

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseSessionTimeoutProps {
  timeout: number // timeout in minutes
  onLogout?: () => void
  enabled?: boolean
}

export function useSessionTimeout({ timeout, onLogout, enabled = true }: UseSessionTimeoutProps) {
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningRef = useRef<NodeJS.Timeout>()

  const logout = useCallback(() => {
    // Clear timers before logout
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    
    if (onLogout) {
      onLogout()
    } else {
      router.push("/admin/login")
    }
  }, [onLogout, router])

  const resetTimer = useCallback(() => {
    if (!enabled) return

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)

    const timeoutMs = timeout * 60 * 1000 // convert minutes to milliseconds

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      logout()
    }, timeoutMs)
  }, [timeout, logout, enabled])

  const handleActivity = useCallback(() => {
    if (enabled) {
      resetTimer()
    }
  }, [resetTimer, enabled])

  useEffect(() => {
    if (!enabled) return

    // Activity events to monitor
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Start the timer
    resetTimer()

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [handleActivity, resetTimer, enabled, timeout])

  return { resetTimer }
}