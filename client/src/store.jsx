import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {seedEvents,seedRegistrations,seedUsers,passwordForSeedAccount} from './data';
import {canManageEvent,canManageRegistrations,canCreateEvent,registrationEligibility,validateEvent,normalizedEmail,validSchoolEmail,canAssignOrganizer} from './domain';
const Context=createContext(null);
const get=(k,def)=>{try{const v=localStorage.getItem('viarena_p2_'+k);return v?JSON.parse(v):def}catch{return def}};
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function StoreProvider({children}){
 const [users,setUsers]=useState(()=>get('users',seedUsers));
 const [events,setEvents]=useState(()=>get('events',seedEvents));
 const [registrations,setRegistrations]=useState(()=>get('registrations',seedRegistrations));
 const [sessionId,setSessionId]=useState(()=>get('session',null));
 const [passwords,setPasswords]=useState(()=>get('passwords',{}));
 const [flash,setFlash]=useState(null);
 const [roleAudit,setRoleAudit]=useState(()=>get('role_audit',[]));
 const user=users.find(x=>x.id===sessionId)||null;
 useEffect(()=>localStorage.setItem('viarena_p2_passwords',JSON.stringify(passwords)),[passwords]);
 useEffect(()=>localStorage.setItem('viarena_p2_users',JSON.stringify(users)),[users]);
 useEffect(()=>localStorage.setItem('viarena_p2_role_audit',JSON.stringify(roleAudit)),[roleAudit]);
 useEffect(()=>localStorage.setItem('viarena_p2_events',JSON.stringify(events)),[events]);
 useEffect(()=>localStorage.setItem('viarena_p2_registrations',JSON.stringify(registrations)),[registrations]);
 useEffect(()=>{if(sessionId)localStorage.setItem('viarena_p2_session',JSON.stringify(sessionId));else localStorage.removeItem('viarena_p2_session')},[sessionId]);
 useEffect(()=>{const sync=event=>{if(!event.key?.startsWith('viarena_p2_'))return;if(event.key==='viarena_p2_users')setUsers(get('users',seedUsers));if(event.key==='viarena_p2_role_audit')setRoleAudit(get('role_audit',[]));if(event.key==='viarena_p2_events')setEvents(get('events',seedEvents));if(event.key==='viarena_p2_registrations')setRegistrations(get('registrations',seedRegistrations));if(event.key==='viarena_p2_passwords')setPasswords(get('passwords',{}));if(event.key==='viarena_p2_session')setSessionId(get('session',null))};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);
 const notify=(message,type='success')=>setFlash({message,type,id:uid()});
 // Local prototype credentials only. Production authentication must use a server session.
 const digest=async(password,salt)=>{const bytes=new TextEncoder().encode(`${salt}:${password}`);const data=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('')};
 const login=async(email,password)=>{const member=users.find(u=>normalizedEmail(u.email)===normalizedEmail(email));if(!member)throw Error('Incorrect email or password.');const credential=passwords[member.id];const match=credential?await digest(password,credential.salt)===credential.hash:seedUsers.some(u=>u.id===member.id)&&password===passwordForSeedAccount;if(!match)throw Error('Incorrect email or password.');setSessionId(member.id);return member};
 const signup=async({name,email,studentId,password})=>{const trimmed=name.trim(),address=normalizedEmail(email),student=studentId.trim();if(trimmed.length<2||!student)throw Error('Enter your full name and student ID.');if(!validSchoolEmail(address))throw Error('Use a valid @adnu.edu.ph school email.');if(users.some(x=>normalizedEmail(x.email)===address))throw Error('An account with this email already exists.');if(users.some(x=>x.studentId?.toLowerCase()===student.toLowerCase()))throw Error('This student ID is already registered.');if(password.length<8)throw Error('Password must have at least 8 characters.');const member={id:uid(),name:trimmed,email:address,studentId:student,roles:['Participant'],bio:'',avatar:''};const salt=uid();const hash=await digest(password,salt);setPasswords(a=>({...a,[member.id]:{salt,hash}}));setUsers(a=>[...a,member]);setSessionId(member.id);return member};
 const logout=()=>setSessionId(null);
 const editProfile=(fields)=>{if(!fields.name?.trim()||!fields.studentId?.trim())throw Error('Name and student ID are required.');if(users.some(x=>x.id!==sessionId&&x.studentId?.toLowerCase()===fields.studentId.trim().toLowerCase()))throw Error('This student ID is already in use.');setUsers(a=>a.map(x=>x.id===sessionId?{...x,name:fields.name.trim(),bio:(fields.bio||'').trim(),avatar:fields.avatar||'',studentId:fields.studentId.trim()}:x))};
 const setOrganizerRole=(id,enabled)=>{const member=users.find(x=>x.id===id);const authorization=canAssignOrganizer(user,member,events,enabled);if(!authorization.allowed)throw Error(authorization.reason);setRoleAudit(a=>[{id:uid(),actorId:user.id,actorName:user.name,targetId:id,previousRoles:[...member.roles],nextRoles:enabled?[...new Set([...member.roles,'Organizer'])]:member.roles.filter(r=>r!=='Organizer'),action:enabled?'Assigned Organizer':'Revoked Organizer',timestamp:new Date().toISOString()},...a]);setUsers(a=>a.map(x=>x.id===id?{...x,roles:enabled?[...new Set([...x.roles,'Organizer'])]:x.roles.filter(r=>r!=='Organizer')}:x))};
 const canManageEventFor=(e,actor=user)=>canManageEvent(e,actor);
 const canManageRegistrationsFor=(e,actor=user)=>canManageRegistrations(e,actor);
 const saveEvent=(fields,id=null)=>{if(!user)throw Error('Sign in first.');const original=id?events.find(e=>e.id===id):null;if(id&&(!original||!canManageEventFor(original)))throw Error('You cannot edit this event.');if(!id&&!canCreateEvent(user))throw Error('Organizer permission required.');const visibility=fields.visibility==='Published'?'Published':'Draft';const validation=validateEvent(fields,visibility==='Published',id?count(id):0);if(validation)throw Error(validation);const safe={title:fields.title.trim(),description:(fields.description||'').trim(),category:fields.category,venue:fields.venue.trim(),start:fields.start,end:fields.end,deadline:fields.deadline,capacity:Number(fields.capacity),cover:fields.cover||'',eligibility:(fields.eligibility||'').trim(),visibility,updatedAt:new Date().toISOString()};if(id){setEvents(a=>a.map(e=>e.id===id?{...e,...safe}:e));return id}const nextId=uid();setEvents(a=>[{...safe,id:nextId,ownerId:user.id,coOrganizers:[],createdAt:new Date().toISOString()},...a]);return nextId};
 const count=(eventId)=>registrations.filter(r=>r.eventId===eventId&&r.status==='Registered').length;
 const isRegistered=(eventId)=>!!user&&registrations.some(r=>r.eventId===eventId&&r.userId===user.id&&r.status==='Registered');
 const getRegistrationEligibility=(eventId)=>registrationEligibility(events.find(e=>e.id===eventId),count(eventId),isRegistered(eventId));
 const register=(eventId)=>{if(!user)throw Error('Sign in before registering.');const eligibility=getRegistrationEligibility(eventId);if(!eligibility.allowed)throw Error(eligibility.reason);setRegistrations(a=>[...a,{id:uid(),eventId,userId:user.id,createdAt:new Date().toISOString(),status:'Registered'}])};
 const cancelRegistration=(eventId,participantId=user?.id)=>{const event=events.find(e=>e.id===eventId);if(!user||!event||(participantId!==user.id&&!canManageRegistrationsFor(event)))throw Error('You cannot cancel this registration.');if(participantId===user.id&&new Date(event.end)<=new Date())throw Error('Completed event registrations cannot be canceled.');setRegistrations(a=>a.map(r=>r.eventId===eventId&&r.userId===participantId&&r.status==='Registered'?{...r,status:'Canceled'}:r))};
 const state=useMemo(()=>({user,users,events,registrations,roleAudit,flash,setFlash,notify,login,signup,logout,editProfile,setOrganizerRole,canManageEvent:canManageEventFor,canManageRegistrations:canManageRegistrationsFor,saveEvent,count,isRegistered,getRegistrationEligibility,register,cancelRegistration}),[user,users,events,registrations,roleAudit,flash,passwords]);
 return <Context.Provider value={state}>{children}</Context.Provider>
}
export const useStore=()=>useContext(Context);
