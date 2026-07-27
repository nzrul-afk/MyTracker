import { useEffect, useRef } from 'react';
import { db } from '../lib/db';

// Map of triggered notifications to avoid spamming the same notification in a single minute
// Key format: "type_id_minute"
const triggeredMap = new Set<string>();

function playAlarmSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const pattern = localStorage.getItem('alarmPattern') || 'beep';
    const now = ctx.currentTime;
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = pattern === 'siren' ? 'square' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(1, startTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    };

    if (pattern === 'beep') {
      playTone(880, now, 0.3);
      playTone(880, now + 0.4, 0.3);
      playTone(880, now + 0.8, 0.3);
    } else if (pattern === 'pulse') {
      for(let i=0; i<6; i++) {
        playTone(1000, now + i*0.15, 0.1);
      }
    } else if (pattern === 'siren') {
      playTone(600, now, 0.4);
      playTone(800, now + 0.4, 0.4);
      playTone(600, now + 0.8, 0.4);
      playTone(800, now + 1.2, 0.4);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

function showNotification(title: string, body: string, isAlarm: boolean) {
  // 1. Trigger Sound if Alarm
  if (isAlarm) {
    playAlarmSound();
  }

  // 2. Trigger System Notification if permitted
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/vite.svg', // Placeholder icon
      vibrate: isAlarm ? [200, 100, 200, 100, 200] : undefined
    } as any);
  } else if (Notification.permission !== 'denied') {
    // Request permission if not yet decided
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
}

export function useNotificationSystem() {
  const intervalRef = useRef<number | null>(null);

  // Request Notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkSchedules = async () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      const currentDateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const currentDayOfWeek = now.getDay(); // 0-6
      
      // Minute key to prevent double triggers within the same minute
      const minuteKey = `${currentDateString}-${currentTime}`;

      try {
        // 1. Check Routines (Jadwal Harian)
        const routines = await db.routines.where('dayOfWeek').equals(currentDayOfWeek).toArray();
        for (const routine of routines) {
          if (routine.reminderType && routine.reminderType !== 'none' && routine.startTime === currentTime) {
            const triggerId = `routine_${routine.id}_${minuteKey}`;
            if (!triggeredMap.has(triggerId)) {
              triggeredMap.add(triggerId);
              showNotification(
                `Jadwal: ${routine.title}`, 
                `Dimulai sekarang (${routine.startTime} - ${routine.endTime}) di ${routine.location || 'Tidak ada lokasi'}`, 
                routine.reminderType === 'alarm'
              );
            }
          }
        }

        // 2. Check Schedules (Kalender Agenda)
        const schedules = await db.schedules.toArray();
        for (const schedule of schedules) {
          if (schedule.reminderType && schedule.reminderType !== 'none') {
            const scheduleDate = new Date(schedule.date);
            const sHours = String(scheduleDate.getHours()).padStart(2, '0');
            const sMinutes = String(scheduleDate.getMinutes()).padStart(2, '0');
            const sTime = `${sHours}:${sMinutes}`;
            const sDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;

            if (sDateString === currentDateString && sTime === currentTime) {
              const triggerId = `schedule_${schedule.id}_${minuteKey}`;
              if (!triggeredMap.has(triggerId)) {
                triggeredMap.add(triggerId);
                showNotification(
                  `Agenda: ${schedule.title}`, 
                  `Agenda Anda telah tiba!`, 
                  schedule.reminderType === 'alarm'
                );
              }
            }
          }
        }

      } catch (err) {
        console.error("Error checking notifications:", err);
      }
    };

    // Run check every 30 seconds
    intervalRef.current = window.setInterval(checkSchedules, 30000);
    // Initial check
    checkSchedules();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
