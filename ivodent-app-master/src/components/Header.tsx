import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "gatsby";

import { StaticImage } from "gatsby-plugin-image";

import {
  AcademicIcon,
  BookIcon,
  ClassRoomLogo,
  ClipboardIcon,
  CreditCardIcon,
  GoogleDriveLogo,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  UserIcon,
} from "./CustomIcons";
import { Button, User } from "./UI";
import Context from "./Context";

import { logout } from "@utils/firebase";

import * as styles from "@styles/components/header.module.scss";

const Header: React.FC = () => {
  const headerEl = useRef<HTMLElement>(null);
  const { currentUser, setCurrentUser } = useContext(Context);
  const [visibleNav, setVisibleNav] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside: ({ target }: MouseEvent) => void = ({
      target,
    }) => {
      if (headerEl.current && !headerEl.current.contains(target as Node)) {
        setVisibleNav(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const navigation: {
    title: string;
    icon?: JSX.Element;
    url: string;
  }[] = (() => {
    if (!currentUser) return [];

    const externalLinks = [
      {
        title: "Email",
        icon: <MailIcon />,
        url: "https://accounts.google.com/v3/signin/identifier?dsh=Shttps%3A%2F%2Fmail.google.com%2Fmail%2F&hd=ivodent.edu.al&sacu=1&service=mail&flowName=GlifWebSignIn&flowEntry=AddSession",
      },
      {
        title: "Classroom",
        icon: <ClassRoomLogo />,
        url: "https://classroom.google.com/",
      },
      {
        title: "Drive",
        icon: <GoogleDriveLogo />,
        url: "https://drive.google.com/drive/",
      },
    ];

    switch (currentUser.role) {
      case "admin":
        return [
          {
            title: "Studentet",
            icon: <UserIcon />,
            url: "/admin/students",
          },
          {
            title: "Pedagogët",
            icon: <AcademicIcon />,
            url: "/admin/teachers",
          },
          {
            title: "Degët",
            icon: <BookIcon />,
            url: "/admin/courses",
          },
          {
            title: "Notat",
            icon: <ClipboardIcon />,
            url: "/admin/grades",
          },
          ...externalLinks,
        ];

      case "student":
        return [
          {
            title: "Notat",
            icon: <AcademicIcon />,
            url: "/student",
          },
          {
            title: "Tarifa",
            icon: <CreditCardIcon />,
            url: "/student/payment",
          },
          ...externalLinks,
        ];

      case "teacher":
        return [
          {
            title: "Notat",
            icon: <ClipboardIcon />,
            url: "/teacher",
          },

          ...externalLinks,
        ];

      default:
        return [];
    }
  })();

  return (
    <header className={styles.header} ref={headerEl}>
      <StaticImage
        src="../images/logo.png"
        alt="Ivodent Logo"
        height={60}
        placeholder="none"
        className={styles.header__logo}
      />

      <nav
        className={`${styles.header__nav} ${
          visibleNav ? styles.header__nav__visible : ""
        }`}
      >
        <ul className={styles.nav__list}>
          {navigation.map(({ title, icon, url }, index) =>
            url.startsWith("http") ? (
              <a href={url} target="_blank" key={index}>
                <li className={styles.nav__item}>
                  {icon} {title}
                </li>
              </a>
            ) : (
              <Link to={url} key={index}>
                <li className={styles.nav__item}>
                  {icon} {title}
                </li>
              </Link>
            )
          )}
        </ul>

        {currentUser && (
          <div className={styles.header__user}>
            <User
              name={`${currentUser.name as string} ${
                (currentUser.lastName as string) ?? ""
              }`}
              email={currentUser.email as string}
            />

            <button
              className={styles.user__logout}
              onClick={async () => {
                await logout();
                setCurrentUser(null);
              }}
            >
              <LogOutIcon />
            </button>
          </div>
        )}
      </nav>

      <Button
        className={styles.header__menu_toggle}
        onClick={() => {
          setVisibleNav((prevState) => !prevState);
        }}
        icon={<MenuIcon />}
      />
    </header>
  );
};

export default Header;
