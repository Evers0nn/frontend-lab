import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Notification from "../ui/Notification";
export default function Layout({view,onNavigate,children}){const [mobileOpen,setMobileOpen]=useState(false);return <div className="app-shell"><Notification/><Sidebar view={view} onNavigate={onNavigate} mobileOpen={mobileOpen} onClose={()=>setMobileOpen(false)}/><div className="main-shell"><Header view={view} onMenu={()=>setMobileOpen(true)}/><main className="content">{children}</main></div></div>}
