import Head from 'next/head'
import Image from 'next/image'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { Navbar } from "./navigation/navbar";
import { Footer } from "./footer/footer";
import { Hero } from "./hero/hero";
import useTranslation from 'next-translate/useTranslation'
import { navLinks } from "./nav-data";
import { useRouter } from 'next/router';

export const siteTitle = 'Theatralis - Cyprus theatre listing';

export default function Layout({ children, home }) {
   const { t, lang } = useTranslation('common');
   const router = useRouter();
  return (
    <div className={`antialiased w-full text-gray-700`}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Find all theatre events in Cyprus"
        />
        <meta
          property="og:image"
          content={`https://i.pinimg.com/originals/fb/86/15/fb8615290f9d95e38e701377b3d3e78d.png`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

       <Navbar>
          {navLinks.map((link, index) => {
             return (
                <>
                <li className="ml-2">
                   <Link href={link.path} activeStyle={{'fontWeight': "bold"}}>
                      <a key={index}
                         className={router.pathname === link.path ? "active" : ""}>{t(link.key)}</a>
                   </Link>
                </li>
                <li className="ml-2 brand-red">
                  |
               </li>
                </>
             );
          })}
          <li className={"ml-2"}>
             <Link href="/" locale="en">
                <a>EN</a>
             </Link>
          </li>
          <li className="ml-2 brand-red">
             |
          </li>
          <li className={"ml-2"}>
             <Link href="/"  locale="gr">
                <a>GR</a>
             </Link>
          </li>
       </Navbar>

       { home && <Hero/> }

      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>  ← {t("backToHome")}</a>
          </Link>
        </div>
      )}

       <Footer />
    </div>
  )
}
