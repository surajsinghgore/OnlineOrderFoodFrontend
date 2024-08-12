"use client";

import React, { useEffect, useState } from "react";
import Image from "next/legacy/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import CategoryModels from "@/app/modal/CategoryModels";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/Store";
interface NameType {
  en: string;
  he: string;
  ru: string;
}
import CheckIcon from "@mui/icons-material/Check";
import Loading from "@/app/components/loading/Loading";
import { useTranslation } from "react-i18next";
import { getFromLocalStorage, setInLocalStorage } from "@/app/utills/LocalStorageUtills";
import { useRouter } from "next/navigation";
import onloadImg from "../../../assests/white_logo.png";
interface CategoryModel {
  id: string;
  Name: NameType;
  ImageUrl: string;
  // Add other properties if needed
}
import AOS from "aos";
import "aos/dist/aos.css";
interface CategoryShow {
  categoryName: string;
  displayText: string;
}
let categoryTitleText = {
  en: "Category List",
  he: "רשימת קטגוריות",
  ru: "Список категорий",
};
let backBtnTitleText = {
  en: "Back",
  he: "חזור",
  ru: "خلف",
};
const Category: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<CategoryModels[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const cart = useSelector((state: RootState) => state.Product.cart);
  const products = useSelector((state: RootState) => state.Product.products);
  const [lang, setLang] = useState<string>("en"); // Set initial language to English

  useEffect(() => {
    // Fetch the language from local storage and set it before translations are applied
    const savedLanguage = getFromLocalStorage("lang") || "en";
    setLang(savedLanguage);
  }, []);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Mealsdemo"));
      const categoryList: CategoryModels[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<CategoryModels, "id">;
        return {
          ...data,
          id: doc.id,
        } as CategoryModels;
      });

      let setArray: CategoryShow[] = [];
      categoryList.forEach((item:any) => {
        let langText = getFromLocalStorage("lang") || "en";
        const localStorageValue = getFromLocalStorage(`${item?.Name?.en}`);
        if (langText == "he") {
          setArray.push({ categoryName: item?.Name?.en, displayText: item?.Name?.he });
        }
        if (langText == "ru") {
          setArray.push({ categoryName: item?.Name?.en, displayText: item?.Name?.ru });
        } else {
          setArray.push({ categoryName: item?.Name?.en, displayText: item?.Name?.en });
        }
        if (localStorageValue === null) {
          // Check if there's no value in local storage
          setInLocalStorage(`${item?.Name?.en}`, []);
        }
      });
      const uniqueCategories: CategoryShow[] = setArray.filter((category, index, self) => index === self.findIndex((t) => t.categoryName === category.categoryName));
      setInLocalStorage("categoryTranslate", uniqueCategories);

      const translatedData: CategoryModels[] = categoryList.map((item:any) => ({
        ...item,
        Name: item.Name[lang as keyof typeof item.Name] || item?.Name?.en,
        enName: item.Name.en,
      }));
      setCategories(translatedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lang) {
      fetchCategory();
    }
  }, [lang, i18n.language, products, cart]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
    AOS.refresh();
  }, []);

  const handleNavigate = (item: CategoryModels) => {
    setInLocalStorage("categoryProduct", item?.Name);
    router.push("/online_ordering/products");
  };

  useEffect(() => {
    setLang(getFromLocalStorage("lang"));
  }, [getFromLocalStorage("lang")]);
  return (
    <>
      {loading && <Loading />}
      <section className="main-bg">
        <div className="page_width h-full">
          <div className="h-full">
            <div className="flex justify-center h-full p-10">
              <Link href={"/"}>
                <Image width={200} height={100} src={onloadImg} alt="onload img" />
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <a href={"/online_ordering"} className={`text-[#fff] bg-[#ded4c4] p-3 rounded-xl font-bold ${lang === "he" ? "rtl" : ""}`}>
                {lang == "he" ? backBtnTitleText.he : lang === "ru" ? backBtnTitleText.ru : backBtnTitleText.en}
              </a>
              <div className={`flex-1 font-bold text-white text-xl ${lang === "he" ? "rtl" : "text-center"}`}>
                {lang == "he" ? categoryTitleText.he : lang === "ru" ? categoryTitleText.ru : categoryTitleText.en}
              </div>
            </div>
            {categories?.map((item) => {
              interface Category {
                mealName: string;
                maxCount: number;
              }
              const displayName:any = item.Name[lang as keyof typeof item.Name] || item.Name;
              let isComplete = false;
              if (getFromLocalStorage("category")) {
                const ItemsInCart: Category[] = getFromLocalStorage("category").filter((category: any) => category.mealName === item.enName);
                if(ItemsInCart.length!==0){

                  let cartItems = getFromLocalStorage(`${ItemsInCart[0].mealName}`);
                  isComplete = cartItems.length === ItemsInCart[0].maxCount ? true : false;
                }
              }
              return (
                <div className="flex flex-col gap-5 py-5" key={item?.id} data-aos="flip-right">
                  <div className="w-full h-[185px] relative cursor-pointer" onClick={() => handleNavigate(item)}>
                    <div className={`bg-[#00000083] absolute top-0 w-full h-full left-0 rounded-lg productShadow`}></div>
                    <Image className="object-cover w-full h-full rounded-lg" src={item?.ImageUrl} alt="category image" layout="fill" priority />
                    <p className={`absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-xl text-white font-bold ${lang === "he" ? "rtl" : ""} textShadows`}>{displayName}</p>
                    {isComplete && (
                      <div className="absolute top-0 left-0 w-full h-full bg-[#9efeb98a] flex items-center justify-center z-10 rounded-lg">
                        <CheckIcon style={{ fontSize: 80, color: "white" }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Category;
