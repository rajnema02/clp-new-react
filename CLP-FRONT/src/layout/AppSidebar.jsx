import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  GridIcon,
  ChevronDownIcon,
  HorizontaLDots,
  TableIcon,
  UserCircleIcon,
  PlugInIcon
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

const adminNavItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/admin-dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Admin Profile",
    path: "/profile",
  },
  {
    icon: <UserCircleIcon />,
    name: "Batch Details",
    path: "/batch-list",
  },
  {
    icon: <UserCircleIcon />,
    name: "Messages",
    path: "/message-list",
  },
  {
    name: "Course",
    icon: <TableIcon />,
    subItems: [
      { name: "Course list", path: "/course-list", pro: false },
      { name: "Module", path: "/module-list", pro: false }
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Study Material Details",
    path: "/study-material-list",
  },
  {
    name: "Exam",
    icon: <TableIcon />,
    subItems: [
      { name: "Exam list", path: "/exam-list", pro: false },
      { name: "Question Bank", path: "/question-bank-list", pro: false },
      { name: "Bulk Upload", path: "/bulk-upload-list", pro: false },
      { name: "Schedule Exam", path: "/schedule-exam-list", pro: false }
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "User Management",
    path: "/user-management",
  }
];

const studentNavItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/student-dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Student Profile",
    path: "/student-profile-form",
  },
  {
    icon: <UserCircleIcon />,
    name: "About Program",
    path: "/student-about-program",
  },
  {
    icon: <UserCircleIcon />,
    name: "Messages",
    path: "/student-message",
  },
  {
    icon: <UserCircleIcon />,
    name: "Video Library",
    path: "/student-video-library",
  },
  {
    name: "Exams",
    icon: <TableIcon />,
    subItems: [
      { name: "Exam List", path: "/student-exam-list", pro: false },
      { name: "Demo Exam", path: "/student-demo-exam", pro: false },
    ],
  },
  {
    name: "Certificates",
    icon: <TableIcon />,
    subItems: [
      { name: "My Certificates", path: "/student-certificate", pro: false },
    ],
  }
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const accountItems = [
    {
      icon: <PlugInIcon />,
      name: "Account",
      subItems: [
        { 
          name: "Log Out", 
          action: () => {
            logout();
            navigate(isAdmin ? '/admin-login' : '/login');
          }
        }
      ],
    },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  useEffect(() => {
    let submenuMatched = false;
    
    const checkSubItems = (items) => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (subItem.path && isActive(subItem.path)) {
              setOpenSubmenu({
                type: "main",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    };

    checkSubItems(navItems);
    checkSubItems(accountItems);

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={`${menuType}-${nav.name}-${index}`}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && nav.subItems && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : nav.path ? (
            <Link
              to={nav.path}
              className={`menu-item group ${
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          ) : nav.action ? (
            <button
              onClick={nav.action}
              className={`menu-item group menu-item-inactive`}
            >
              <span className={`menu-item-icon-size menu-item-icon-inactive`}>
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </button>
          ) : null}
          
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem, subIndex) => (
                  <li key={`${menuType}-${index}-${subIndex}`}>
                    {subItem.path ? (
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ) : (
                      <button
                        onClick={subItem.action}
                        className={`menu-dropdown-item menu-dropdown-item-inactive w-full text-left`}
                      >
                        {subItem.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/admin-dashboard" className="flex items-center gap-3">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="./images/logo/logo-new.png"
                alt="Logo"
                width={25}
                height={25}
              />
              <h1 className="text-lg font-semibold">CLP-Exam Portal</h1>
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Account"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(accountItems, "account")}
            </div>
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;