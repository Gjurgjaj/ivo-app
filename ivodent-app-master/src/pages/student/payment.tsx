import React, { useCallback, useContext, useEffect, useState } from "react";

import Layout from "@components/Layout";
import Seo from "@components/Seo";
import Context from "@components/Context";

import { CheckBoxGroup } from "@ui";
import { formatDate, getDayDifference } from "@utils/helper";
import { Course } from "@interface/context";
import { collection, getDocs, query } from "firebase/firestore";
import { LoadingIcon } from "@icon";

import { db } from "@utils/firebase";

import * as styles from "@styles/pages/payment.module.scss";
import moment from "moment";

const PaymentPage: React.FC = () => {
  const { currentUser } = useContext(Context);

  const [loading, setLoading] = useState<boolean>(true);
  const [coursesList, setCoursesList] = useState<Course[]>([]);

  const fetchCourses = useCallback(async (studentsCourses: string[]) => {
    setLoading(true);

    try {
      const docs = await getDocs(query(collection(db, "courses")));

      if (docs.docs.length > 0) {
        const courses = docs.docs.map((item) => ({
          ...item.data(),
          id: item.id,
        })) as Course[];

        const coursesMap: {
          [x: string]: boolean;
        } = {};

        studentsCourses.forEach((item) => {
          coursesMap[item as string] = true;
        });

        const filteredCourses = courses.filter(
          (e) => coursesMap[e.id as string]
        );

        setCoursesList(filteredCourses);
      }
    } catch (error) {
      // console.log(error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCourses(currentUser.payments?.map((e) => e.id) ?? []);
    }
  }, [currentUser]);

  return (
    <Layout>
      <Seo title="Payment" />

      <h1 className={styles.payment__title}>Tarifat</h1>

      {loading && (
        <div className={styles.payment__loading}>
          <LoadingIcon />
        </div>
      )}

      {!loading &&
        currentUser &&
        currentUser.payments &&
        coursesList.length > 0 && (
          <>
            <ul className={styles.payments}>
              {currentUser.payments.map((item) => {
                const allPaymentsCount =
                  item.payments.length > 0
                    ? item.payments
                        .map((e) => e.price)
                        .filter((e) => e)
                        .reduce(
                          (prevValue, currentValue) =>
                            (prevValue += currentValue),
                          0
                        )
                    : 0;

                const userDiscount = item.discount ? item.discount : 0;

                const extendedPaymentFee: number =
                  item?.expire?.startDate &&
                  item?.expire?.endDate &&
                  item?.expire?.cost &&
                  !item?.done &&
                  new Date().getTime() >=
                    new Date(item?.expire?.startDate).getTime()
                    ? Number(
                        (
                          getDayDifference(
                            item?.expire?.startDate,
                            new Date().getTime() >
                              new Date(item?.expire?.endDate).getTime()
                              ? item?.expire?.endDate
                              : new Date().toString()
                          ) * item?.expire?.cost
                        ).toFixed(2)
                      )
                    : 0;

                const notPaidAmount =
                  (item?.cost ?? 0) +
                  extendedPaymentFee -
                  (allPaymentsCount + userDiscount);

                const course = coursesList.find((e) => e.id === item.id);

                const valuteText = item?.euro ? "€" : "ALL ";

                return (
                  <li className={styles.payments__item} key={item.id}>
                    <CheckBoxGroup
                      title={`Dega ${course?.course.replace(/[0-9]/g, "")}${
                        course?.year ? ` - Viti i ${course?.year}` : ""
                      }`}
                      status={(() => {
                        if (notPaidAmount <= 0) return "success";

                        if (extendedPaymentFee > 0) return "fail";

                        return "light";
                      })()}
                    >
                      <div className={styles.content__total_payment}>
                        <h3 className={styles.price}>
                          {valuteText}
                          {notPaidAmount}
                        </h3>
                        <span className={styles.description}>
                          Totali per tu paguar
                        </span>
                      </div>
                      <div className={styles.content__payments}>
                        <p className={styles.payments__title}>
                          Pagesa te realizuara:
                        </p>

                        {item.payments.length > 0 ? (
                          <ul className={styles.students__payments}>
                            {item.payments
                              .sort(
                                (a, b) =>
                                  new Date(b.date).valueOf() -
                                  new Date(a.date).valueOf()
                              )
                              .map(({ price, date }, index) => (
                                <li key={index} className={styles.payment}>
                                  {`${formatDate(new Date(date))} - €${price}`}{" "}
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <strong>Boshe</strong>
                        )}
                      </div>

                      <div className={styles.content__info}>
                        <p className={styles.info__main}>
                          {item.expire?.startDate &&
                            item.expire?.endDate &&
                            `Detyrimi më datë ${formatDate(
                              new Date(item.expire?.startDate)
                            )} deri  ${formatDate(
                              new Date(item.expire?.endDate)
                            )}`}

                          {item?.expire?.enabled &&
                            item?.expire?.startDate &&
                            item?.expire?.endDate &&
                            item?.expire?.cost &&
                            !!extendedPaymentFee && (
                              <span>
                                Kamatë +{valuteText}
                                {extendedPaymentFee}
                              </span>
                            )}
                        </p>
                      </div>
                    </CheckBoxGroup>
                  </li>
                );
              })}
            </ul>

            <div className={styles.bank__details}>
              <h3>UNION BANK</h3>

              <p>Ivodent shpk</p>
              <p>
                Llogaria në euro: <strong>111356874020123</strong>
              </p>
              <p>
                IBAN: <strong>AL37214111060111356874020123</strong>
              </p>

              <p>
                Llogaria në lek: <strong>111 3568 7402 0112 </strong>
              </p>

              <p>
                IBAN: <strong>AL 43 2141 1106 0111 3568 7402 0112</strong>
              </p>

              <p>
                Përshkrimi: Emër Atësi Mbiemër, Dega e studimit, Viti i studimit
              </p>
            </div>
          </>
        )}
    </Layout>
  );
};

export default PaymentPage;
