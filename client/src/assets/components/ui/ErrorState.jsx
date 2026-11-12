import React, { useId, useState, useEffect, useRef } from 'react';
import { CalendarDays, ChevronRight, ClipboardList, Compass, FileText, Home, LogOut, Menu, Radio, Shield, User, Users, X, CheckCircle2, AlertCircle, Plus, Settings, Lock, Search, LoaderCircle } from 'lucide-react';
import { Button } from './Button';
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return <div className="empty" role="alert">
    <AlertCircle size={32} />
    <h3>Unable to load content</h3>
    <p>{message}</p>{onRetry && <Button onClick={onRetry}>Try again</Button>}
  </div>
}
