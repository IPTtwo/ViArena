import React, { useId, useState, useEffect, useRef } from 'react';
import { CalendarDays, ChevronRight, ClipboardList, Compass, FileText, Home, LogOut, Menu, Radio, Shield, User, Users, X, CheckCircle2, AlertCircle, Plus, Settings, Lock, Search, LoaderCircle } from 'lucide-react';
export function Button({ children, variant = 'primary', className = '', ...props }) {
  return <button className={`button ${variant} ${className}`} {...props}>{children}</button>
}
