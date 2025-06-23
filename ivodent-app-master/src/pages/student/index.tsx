import React, { useCallback, useContext, useEffect, useState } from "react";

import { Button, Status, Table } from "@ui";
import Layout from "@components/Layout";
import Seo from "@components/Seo";

import { Course, StudentGrade } from "@interface/context";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@utils/firebase";
import Context from "@components/Context";
import { LoadingIcon } from "@icon";
import { getYear } from "@utils/helper";

import * as styles from "@styles/pages/dashboard.module.scss";
import { gradesInAlbanian } from "@data/grades";

const DashboardPage: React.FC = () => {
  const { currentUser } = useContext(Context);

  const [loading, setLoading] = useState<boolean>(true);
  const [coursesList, setCoursesList] = useState<Course[]>([]);

  const fetchCourses = async (studentsCourses: string[]) => {
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
      console.log(error);
    }
  };

  const fetchGrades = async (uid: string) => {
    const gradesQuery = query(
      collection(db, "grades"),
      where("student", "==", uid)
    );

    const gradeDocs = await getDocs(gradesQuery);

    if (gradeDocs.docs.length > 0) {
      const studentsMap: { [x: string]: number | string } = {};

      gradeDocs.docs.forEach((item) => {
        const data = item.data() as StudentGrade;

        data.subjects.forEach((e) => {
          studentsMap[e.key] = e.grade;
        });
      });

      setCoursesList((prevState) =>
        prevState.map((item) => ({
          ...item,
          subjects: item.subjects.map((e) => ({
            ...e,
            grade: (studentsMap[e.key] as string) ?? "",
          })),
        }))
      );
    }
  };

  const onLoad = async () => {
    if (currentUser) {
      setLoading(true);

      await fetchCourses(currentUser?.payments?.map((e) => e.id) ?? []);
      await fetchGrades(currentUser.uid);

      setLoading(false);
    }
  };

  useEffect(() => {
    onLoad();
  }, [currentUser]);

  return (
    <Layout>
      <Seo title="Dashboard" />

      <div className={styles.dashboard}>
        <h1 className={styles.dashboard__title}>Lista e Notave</h1>

        {loading && (
          <div className={styles.dashboard__loading}>
            <LoadingIcon />
          </div>
        )}

        {!loading &&
          coursesList
            .sort((a, b) => a.course.localeCompare(b.course))
            .map((item) => {
              const courseDate: string = (() => {
                if (
                  currentUser &&
                  currentUser.payments &&
                  currentUser.payments.length > 0
                ) {
                  const paymentsData = currentUser.payments.filter(
                    (i) => i.id === item.id
                  );

                  if (paymentsData.length > 0) {
                    return `${getYear(paymentsData[0].startDate)}-${
                      getYear(paymentsData[0].startDate) + 1
                    }`;
                  }
                }

                return "";
              })();

              return (
                <Table
                  title={`Dega ${item.course.replace(
                    /[0-9]/g,
                    ""
                  )}  ${courseDate} Viti i ${item.course.replace(/\D/g, "")}`}
                  key={item.id}
                  className={styles.table}
                  thead={[
                    {
                      title: "Nr.",
                      key: "index",
                    },
                    {
                      title: "Lenda",
                      key: "subject",
                    },
                    {
                      title: "Nota",
                      key: "grade",
                    },
                    {
                      title: "Kredite ECTS",
                      key: "ects",
                    },
                    {
                      title: "Status",
                      key: "status",
                    },
                  ]}
                  tbody={item.subjects.map((item, index) => ({
                    index: <span>{index + 1}</span>,
                    subject: (
                      <span className={styles.dashboard__subject}>
                        {item.value.replace(/[0-9]/g, "")}
                      </span>
                    ),
                    grade: (
                      <span className={styles.dashboard__grade}>
                        {item.grade ? (
                          <>
                            {item.grade}{" "}
                            <span>
                              ({gradesInAlbanian[Number(item.grade)]})
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </span>
                    ),
                    ects: (
                      <span className={styles.dashboard__light}>
                        {item.value.replace(/\D/g, "")}
                      </span>
                    ),
                    status: (
                      <Status
                        className={!item.grade ? styles.dashboard__light : ""}
                        status={
                          item.grade
                            ? Number(item.grade) > 4
                              ? "success"
                              : "fail"
                            : "light"
                        }
                        message={
                          item.grade
                            ? Number(item.grade) > 4
                              ? "Kalues"
                              : "Ngelur"
                            : "Ne Process"
                        }
                      />
                    ),
                  }))}
                />
              );
            })}
      </div>
    </Layout>
  );
};

export default DashboardPage;
