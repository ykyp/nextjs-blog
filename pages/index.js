import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedEventsData } from '../lib/events'
import { Filter } from '../components/filter';
import { ListingEvent } from '../components/listing-event';
import { useState, useEffect } from 'react';
import { Paginator } from 'primereact/paginator';
import * as ga from '../lib/ga'
import React from "react";
import useTranslation from "next-translate/useTranslation";
import { ProgressSpinner } from 'primereact/progressspinner';
import {searchAll} from "../components/search-utils";

const SELECTED_CITY_KEY = 'th.selectedCity';
const SELECTED_CATEGORY_KEY = 'th.selectedCategory';
const SELECTED_PERIOD_KEY = 'th.selectedPeriod';
const SELECTED_FIRST_PAGE = 'th.firstPage';
const SELECTED_CURRENT_PAGE = 'th.currentPage';
const SELECTED_ITEMS_PER_PAGE = 'th.itemsPerPage';


export default function Home({ allEventsData }) {
   const { t, lang } = useTranslation('common');
   const ISSERVER = typeof window === "undefined";

   const [results, setResults] = useState([]);

   const useStateFromStorage = (defaultValue, key) => {
      return useState(() => {
      try {
         if(!ISSERVER) {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
         }
         return defaultValue;
      } catch (error) {
         // If error also return initialValue
         console.log(error);
         return defaultValue;
      }
      });
   };
   const [selectedCity, setSelectedCity] = useStateFromStorage({name: 'AllCities', code: 'ALL'}, SELECTED_CITY_KEY);
   const [selectedPeriod, setSelectedPeriod] = useStateFromStorage({name: 'Anytime', code: 'ALL'}, SELECTED_PERIOD_KEY);
   const [selectedCategory, setSelectedCategory] = useStateFromStorage({name: 'AllCategories', code: 'ALL'}, SELECTED_CATEGORY_KEY);
   const [pageFirst, setPageFirst] = useStateFromStorage(0, SELECTED_FIRST_PAGE);
   const [currentPage, setCurrentPage] = useStateFromStorage(0, SELECTED_CURRENT_PAGE);
   const [rowsPerPage, setRowsPerPage] = useStateFromStorage(10, SELECTED_ITEMS_PER_PAGE);
   const [currentTotalCount, setCurrentTotalCount] = useState(allEventsData.length);
   const [isLoading, setLoading] = useState(true);

   const handleCityChange = (e) => {
      if(!ISSERVER) {
         sessionStorage.setItem(SELECTED_CITY_KEY, JSON.stringify(e.value));
      }
      setSelectedCity(e.value);
   };

   const handlePeriodChange = (e) => {
      if(!ISSERVER) {
         sessionStorage.setItem(SELECTED_PERIOD_KEY, JSON.stringify(e.value));
      }
      setSelectedPeriod(e.value);
   };

   const handleCategoryChange = (e) => {
      if(!ISSERVER) {
         sessionStorage.setItem(SELECTED_CATEGORY_KEY, JSON.stringify(e.value));
      }
      setSelectedCategory(e.value);
   };

   const onBasicPageChange = (event) => {
      setCurrentPage(event.page); 
      setPageFirst(event.first);
      setRowsPerPage(event.rows);
      if(!ISSERVER) {
         sessionStorage.setItem(SELECTED_FIRST_PAGE, event.first);
         sessionStorage.setItem(SELECTED_CURRENT_PAGE, event.page);
         sessionStorage.setItem(SELECTED_ITEMS_PER_PAGE, event.rows);
      }
   };

   useEffect(() => {
      searchEvents();
   }, [selectedPeriod, selectedCity, selectedCategory, currentPage, rowsPerPage]);

   const searchEvents = () => {
      const query = {
         city:  selectedCity.code === 'ALL'? 'ALL' : selectedCity?.name,
         period: selectedPeriod.code,
         category:  selectedCategory.code === 'ALL'? 'ALL' : selectedCategory?.name,
         page: currentPage,
         rows: rowsPerPage,
      };
      const newResults = searchAll(allEventsData, query);
      setResults(() => newResults);
      setCurrentTotalCount(() => newResults.length);
      setLoading(false);
      ga.event({
         action: "search",
         params : {
            search_term: selectedCity.name + "-" + selectedPeriod.name + "-"+ selectedCategory.name
         }
      })
   };

   /*const translatedCity = t(""+selectedCity.name);
   const translatedPeriod = t(""+selectedPeriod.name);
   const translatedAudience = t(""+selectedCategory.name);*/


   return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

       <div className="w-full bg-gray-100">
          <div className="max-w-screen-xl pb-6 mx-auto ">
             <div  className="pb-2 pt-2">
                <Filter onCityChange={handleCityChange}
                        selectedCity={selectedCity}
                        onPeriodChange={handlePeriodChange}
                        selectedPeriod={selectedPeriod}
                        onCategoryChange={handleCategoryChange}
                        selectedCategory={selectedCategory}
                />
             </div>

       {/*<h2 className={utilStyles.headingLg}>Search</h2>
       <Search />*/}

       { !isLoading &&
          <section className={`${utilStyles.headingMd} ${utilStyles.padding1px} m-auto `}
            style={{maxWidth: '787px'}}>
              <h3 className={`${utilStyles.headingLg} formatted-h3`} style={{marginTop: '0.6em'}}>
               {/*  {t('events-for')} {selectedCity && `${t('for-m')} ${(translatedCity)}`},
                 {" " + translatedPeriod.toLowerCase()} {t('for-m')} {translatedAudience.toLowerCase()}*/}</h3>
               { results.length === 0 && <div>{t("noEventsFound")}</div> }
              <div className={utilStyles.list}>
                {results.map((event) => (
                   <ListingEvent event={event} key={event.title} />
                ))}
              </div>
         </section>
       }

          { isLoading  &&
          <section className={`${utilStyles.headingMd} ${utilStyles.padding1px} m-auto flex `}
                                   style={{maxWidth: '787px'}}>
             <ProgressSpinner
                style={{width: '50px', height: '50px'}}
                strokeWidth="4"
                animationDuration="1s"/>
          </section>
          }


          </div>
          </div>
       <Paginator first={pageFirst}
                  rows={rowsPerPage}
                  totalRecords={currentTotalCount}
                  rowsPerPageOptions={[10, 20, 30]}
                  onPageChange={onBasicPageChange}>
       </Paginator>

    </Layout>
  )
}

//this is not used except to populate the length.
//actual data are been fetched from the cache via search.js
export async function getStaticProps() {
  const allEventsData = getSortedEventsData();
  return {
    props: {
      allEventsData: allEventsData,
    }
  }
}
