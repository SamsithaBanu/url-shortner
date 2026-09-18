import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Link2,
  Home,
  Link as LinkIcon,
  Sparkles,
  BarChart3,
  Settings,
  HelpCircle,
  ExternalLink,
  User,
  ChevronsUpDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../lib/api";
import { toast } from "react-toastify";

interface userData {
  created_at: string;
  password_hash: string;
  email: string;
  id: number;
  name: string;
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<userData>()

  const mainNavigation = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "All URLs",
      url: "/all-urls",
      icon: LinkIcon,
    },
  ];

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      console.log('response', response)
      setUser(response)
    } catch (error) {
      setError(error)
    }
  }

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response) {
        toast.success('Successfully Logout the User');
        navigate('/login')
      }
    }
    catch (error) {
      console.log('error', error)
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r !w-[250px]">
      {/* Sidebar Header with Brand Logo */}
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-accent/50 transition-colors">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg !bg-[#0D1282] text-primary-foreground shadow-sm">
                <Link2 className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-[#0D1282]">URL Shortener</span>
                <span className="truncate text-xs text-muted-foreground">Fast & Secure</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="my-1 w-[99%]" />

      {/* Main Content Navigation */}
      <SidebarContent>
        {/* Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="h-9 py-2">
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "bg-[#9CD5FF] font-medium text-accent-foreground" : ""}
                    >
                      <Link to={item.url} className="flex items-center gap-2.5 w-full h-9">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="my-1" />

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="API Docs" className="text-muted-foreground">
              <div
                className="flex items-center gap-2.5 text-xs w-full"
              >
                <User className="size-4" />
                <span className="flex-1 text-left">{user?.name}</span>
                <ChevronsUpDown className="size-3 group-data-[collapsible=icon]:hidden" onClick={handleLogout} />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}