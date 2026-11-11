import React, { useId, useState, useEffect, useRef } from 'react';
import { CalendarDays, ChevronRight, ClipboardList, Compass, FileText, Home, LogOut, Menu, Radio, Shield, User, Users, X, CheckCircle2, AlertCircle, Plus, Settings, Lock, Search, LoaderCircle } from 'lucide-react';
export function Field({ label, error, hint, children }) {
  const id = useId();
  const attach = node => {
    if (!React.isValidElement(node)) return node;
    if (['input', 'textarea', 'select'].includes(node.type) && !node.props.id) return React.cloneElement(node, { id, 'aria-invalid': !!error || !!node.props['aria-invalid'], 'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined });
    if (node.props.children) return React.cloneElement(node, undefined, React.Children.map(node.props.children, attach));
    return node
  };
  return <div className="field">
    <label htmlFor={id}>{label}</label>{React.Children.map(children, attach)}{hint && <small id={`${id}-hint`} className="field-hint">{hint}</small>}{error && <small id={`${id}-error`} className="field-error" role="alert">{error}</small>}
  </div>
}
