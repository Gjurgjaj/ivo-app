import React, { useEffect, useRef, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import Layout from "@components/Layout";
import Seo from "@components/Seo";
import { EditIcon, PlusIcon, TrashIcon, LoadingIcon } from "@icon";
import { Button, Input, Modal, Table, Tags } from "@ui";
import { Course } from "@interface/context";

import { db } from "@utils/firebase";

import * as styles from "@styles/pages/courses.module.scss";

const CoursesPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modal, setModal] = useState<boolean>(false);
  const [addCourseLoading, setAddCourseLoading] = useState<boolean>(false);

  const courseNameEl = useRef<HTMLInputElement>(null);
  const [validCourseName, setValidCourseName] = useState<string | null>(null);
  const courseYear = useRef<HTMLInputElement>(null);
  const [validCourseYear, setValidCourseYear] = useState<string | null>(null);
  const [courseSubjects, setCourseSubjects] = useState<
    {
      value: string;
      key: string;
    }[]
  >([]);
  const [validCourseSubjects, setValidCourseSubjects] = useState<string | null>(
    null
  );
  const [isEdit, setIsEdit] = useState<false | string>(false);

  const onAddCourse: React.FormEventHandler<HTMLFormElement> = async (form) => {
    form.preventDefault();

    if (!courseNameEl.current || !courseYear.current) return;

    let failed: boolean = false;

    if (courseNameEl.current.value.length === 0) {
      setValidCourseName("Vendosni emrin e Deges");
      failed = true;
    }

    if (courseYear.current.value.length === 0) {
      setValidCourseYear("Vendosni vitin e Deges");
      failed = true;
    }

    if (courseSubjects.length === 0) {
      setValidCourseSubjects("Vendosni lendet e Deges");
      failed = true;
    }

    if (failed) {
      return;
    }

    setAddCourseLoading(true);

    const courseData: Course = {
      course: courseNameEl.current.value,
      subjects: courseSubjects,
      year: courseYear.current.valueAsNumber,
    };

    if (isEdit) {
      try {
        await updateDoc(doc(db, "courses", isEdit), {
          ...courseData,
        });

        setCourses((prevState) =>
          prevState.map((item) => {
            if (item.id === isEdit) {
              return {
                ...item,
                ...courseData,
              };
            }

            return item;
          })
        );

        setModal(false);
      } catch (error) {
        // console.log(error);
      }
    } else {
      try {
        const addedCourse = await addDoc(collection(db, "courses"), courseData);

        setCourses((prevState) => [
          ...prevState,
          { ...courseData, id: addedCourse.id },
        ]);

        setModal(false);
      } catch (error) {
        // console.log(error);
      }
    }

    setAddCourseLoading(false);
  };

  const deleteCourse = async (id: string) => {
    try {
      setCourses((prevState) =>
        prevState.map((course) =>
          course.id === id ? { ...course, loading: true } : course
        )
      );

      await deleteDoc(doc(db, "courses", id));

      setCourses((prevState) => prevState.filter((course) => course.id !== id));
    } catch (error) {
      // console.log(error);
    }
  };

  const onEditCourse = ({ course, subjects, id, year }: Course) => {
    if (!courseNameEl.current || !courseYear.current) return;
    setModal(true);

    courseNameEl.current.value = course;
    courseYear.current.valueAsNumber = year;
    setCourseSubjects(subjects);

    setIsEdit(id as string);
  };

  const fetchCourses = async () => {
    try {
      const docs = await getDocs(collection(db, "courses"));

      if (docs.docs.length > 0) {
        const courses = docs.docs.map((item) => ({
          ...item.data(),
          id: item.id,
        })) as Course[];

        setCourses(courses);
      }
    } catch (error) {
      // console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!modal && courseNameEl.current && courseYear.current) {
      courseNameEl.current.value = "";
      courseYear.current.value = "";
      setCourseSubjects([]);
      setValidCourseSubjects(null);
      setValidCourseName(null);
      setValidCourseYear(null);
      setIsEdit(false);
    }
  }, [modal]);

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <Layout>
      <Seo title="Degët" />

      <h1 className={styles.courses__title}>Degët</h1>

      {loading ? (
        <div className={styles.loading}>
          <LoadingIcon />
        </div>
      ) : (
        <Table
          className={styles.table}
          title="Lista e degëve"
          thead={[
            {
              title: "Nr.",
              key: "index",
            },
            {
              title: "Dega",
              key: "course",
            },
            {
              title: "Lëndët",
              key: "subjects",
            },
            {
              title: "Edito",
              key: "edit",
            },
          ]}
          tbody={courses.map(
            ({ course, subjects, id, loading, year }, index) => ({
              index: <span>{index + 1}</span>,
              course,
              subjects: (
                <p className={styles.courses__list}>
                  {subjects.map((item) => item.value).join(", ")}
                </p>
              ),
              edit: (
                <div className={styles.courses__edit}>
                  <Button
                    icon={<EditIcon />}
                    style="light"
                    onClick={onEditCourse.bind(this, {
                      course,
                      subjects,
                      id,
                      year,
                    })}
                  />

                  <Button
                    icon={loading ? <LoadingIcon /> : <TrashIcon />}
                    style="danger"
                    onClick={async () => {
                      await deleteCourse(id as string);
                    }}
                  />
                </div>
              ),
            })
          )}
          actions={
            <Button
              text="Shto Degë"
              icon={<PlusIcon />}
              onClick={() => {
                setIsEdit(false);
                setModal(true);
              }}
            />
          }
        />
      )}

      <Modal visible={modal} setVisible={setModal}>
        <div className={styles.modal__content}>
          <h3 className={styles.modal__header}>
            {isEdit ? "Edito Degën" : "Shto Degën"}
          </h3>

          <form onSubmit={onAddCourse} className={styles.modal__form}>
            <Input
              type="text"
              label="Emri"
              placeholder="Shkruani emrin e lëndës"
              elRef={courseNameEl}
              error={validCourseName}
              onChange={() =>
                validCourseName ? setValidCourseName(null) : null
              }
            />

            <Tags
              tags={courseSubjects}
              setTags={setCourseSubjects}
              placeholder="Lista e lëndëve"
              label="Lëndet"
              error={validCourseSubjects}
              onChange={() => {
                if (validCourseSubjects) {
                  setValidCourseSubjects(null);
                }
              }}
            />

            <Input
              type="number"
              label="Viti"
              placeholder="Numri i Vitit te lendes"
              elRef={courseYear}
              error={validCourseYear}
              onChange={() =>
                validCourseYear ? setValidCourseYear(null) : null
              }
            />

            <Button
              text={isEdit ? "Ruaj Ndryshimet" : "Shto Degën"}
              type="submit"
              icon={
                addCourseLoading ? (
                  <LoadingIcon />
                ) : !isEdit ? (
                  <PlusIcon />
                ) : (
                  <EditIcon />
                )
              }
            />
          </form>
        </div>
      </Modal>
    </Layout>
  );
};

export default CoursesPage;
