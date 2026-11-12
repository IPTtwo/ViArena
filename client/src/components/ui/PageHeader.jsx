import React, { useId, useState, useEffect, useRef } from 'react';
import { CalendarDays, ChevronRight, ClipboardList, Compass, FileText, Home, LogOut, Menu, Radio, Shield, User, Users, X, CheckCircle2, AlertCircle, Plus, Settings, Lock, Search, LoaderCircle } from 'lucide-react';
export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header">
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>{description && <p className="subtext">{description}</p>}
    </div>{action && <div className="page-action">{action}
    </div>}
  </div>
}
