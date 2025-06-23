import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, deleteUser, registerWithEmailAndPassword } from "@utils/firebase";

import { Course, UserItem, UserRole } from "@interface/context";

import Layout from "@components/Layout";
import Seo from "@components/Seo";
import { EditIcon, LoadingIcon, PlusIcon, TrashIcon } from "@icon";
import { Button, Checkbox, Input, Modal, Table, User } from "@ui";

import { validateEmail } from "@utils/helper";

import * as styles from "@styles/pages/teachers.module.scss";

const TeachersPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const [teachersList, setTeachersList] = useState<UserItem[]>([]);

  const [modal, setModal] = useState<boolean>(false);

  const [addTeacherLoading, setAddTeacherLoading] = useState<boolean>(false);

  const [validName, setValidName] = useState<string | null>(null);
  const [validEmail, setValidEmail] = useState<string | null>(null);
  const [validPassword, setValidPassword] = useState<string | null>(null);
  const nameEl = useRef<HTMLInputElement>(null);
  const emailEl = useRef<HTMLInputElement>(null);
  const passwordEl = useRef<HTMLInputElement>(null);

  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loadingCourseList, setLoadingCourseList] = useState<boolean>(false);

  const [isEdit, setIsEdit] = useState<false | string>(false);

  const fetchCourses = useCallback(async (teacherCourses?: string[]) => {
    setLoadingCourseList(true);

    try {
      const docs = await getDocs(query(collection(db, "courses")));

      if (docs.docs.length > 0) {
        const courses = docs.docs.map((item) => ({
          ...item.data(),
          id: item.id,
          checked: false,
        })) as Course[];

        if (teacherCourses) {
          const coursesMap: {
            [x: string]: boolean;
          } = {};

          teacherCourses.forEach((item) => {
            coursesMap[item as string] = true;
          });

          setCoursesList(
            courses.map((item) => ({
              ...item,
              checked: coursesMap[item.id as string],
            }))
          );
        } else {
          setCoursesList(courses);
        }
      }
    } catch (error) {
      // console.log(error);
    }

    setLoadingCourseList(false);
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const docs = await getDocs(
        query(collection(db, "users"), where("role", "==", "teacher"))
      );

      if (docs.docs.length > 0) {
        const teachers = docs.docs.map((item) => ({
          ...item.data(),
          id: item.id,
        })) as UserItem[];

        setTeachersList(teachers);
      }
    } catch (error) {
      // console.log(error);
    }

    setLoading(false);
  }, []);

  const deleteTeacher = async (uid: string, docId: string) => {
    try {
      setTeachersList((prevState) =>
        prevState.map((teacher) =>
          teacher.uid === uid ? { ...teacher, loading: true } : teacher
        )
      );

      await deleteUser(uid, docId);

      setTeachersList((prevState) =>
        prevState.filter((teacher) => teacher.uid !== uid)
      );
    } catch (error) {
      // console.log(error);
    }
  };

  const onAddTeacher: React.FormEventHandler<HTMLFormElement> = async (
    form
  ) => {
    form.preventDefault();

    if (!(emailEl.current && passwordEl.current && nameEl.current)) return;

    let failed: boolean = false;

    if (!validateEmail(emailEl.current.value) && !isEdit) {
      setValidEmail("Vendosni një email te saktë");
      failed = true;
    }

    if (!(passwordEl.current.value.length > 0) && !isEdit) {
      setValidPassword("Vendosni një password");
      failed = true;
    }

    if (!(nameEl.current.value.length > 0)) {
      setValidName("Vendosni një emer pedagogu");
      failed = true;
    }

    if (failed) return;

    setAddTeacherLoading(true);

    const userData: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      courses: string[];
    } = {
      name: nameEl.current.value,
      email: emailEl.current.value,
      password: passwordEl.current.value,
      role: "teacher",
      courses: coursesList
        .filter((item) => item.checked)
        .map((item) => item.id as string),
    };

    if (isEdit) {
      try {
        await updateDoc(doc(db, "users", isEdit), {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          courses: userData.courses,
        });

        setTeachersList((prevState) =>
          prevState.map((item) => {
            if (item.id === isEdit) {
              return {
                ...item,
                ...userData,
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
        const uid = await registerWithEmailAndPassword(userData);

        if (uid) {
          const user = await addDoc(collection(db, "users"), {
            email: userData.email,
            name: userData.name,
            role: userData.role,
            uid,
            courses: coursesList
              .filter((item) => item.checked)
              .map((item) => item.id as string),
          });

          setTeachersList((prevState) => [
            ...prevState,
            { ...userData, uid, id: user.id } as UserItem,
          ]);

          setModal(false);
        }
      } catch (error) {
        // console.log(error);
      }
    }

    setAddTeacherLoading(false);
  };

  const onCheckCourse = (id: string) => {
    setCoursesList((prevState) =>
      prevState.map((item) => ({
        ...item,
        checked: item.id === id ? !item.checked : item.checked,
      }))
    );
  };

  const onChangeName = () => {
    if (validName) {
      setValidName(null);
    }

    if (!emailEl.current || !nameEl.current || !!isEdit) return;

    const email = emailEl.current.value;
    const name = nameEl.current.value;

    const suggestedEmail = `${name
      .toLocaleLowerCase()
      .replaceAll(" ", ".")}@ivodent.edu.al`;

    if (!email || !!name) {
      emailEl.current.value = suggestedEmail;
    }
  };

  const onEditTeacher = async ({ email, id, name, courses }: UserItem) => {
    if (!nameEl.current || !emailEl.current) return;

    setModal(true);

    await fetchCourses(courses);

    nameEl.current.value = name;
    emailEl.current.value = email;

    setIsEdit(id as string);
  };

  useEffect(() => {
    if (!modal && nameEl.current && emailEl.current && passwordEl.current) {
      nameEl.current.value = "";
      emailEl.current.value = "";
      passwordEl.current.value = "";
      setValidName(null);
      setValidEmail(null);
      setValidPassword(null);
      setCoursesList([]);
      setIsEdit(false);
    }
  }, [modal]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <Layout>
      <Seo title="Pedagogët" />

      <h1 className={styles.teachers__title}>Pedagogët</h1>

      {loading ? (
        <div className={styles.loading}>
          <LoadingIcon />
        </div>
      ) : (
        <Table
          title="Lista e pedagogëve"
          className={styles.table}
          thead={[
            {
              title: "Nr.",
              key: "index",
            },
            {
              title: "Emri",
              key: "user",
            },
            {
              title: "Edito",
              key: "edit",
            },
          ]}
          tbody={teachersList.map(
            (
              { name, email, id, uid, loading, role, courses, lastName },
              index
            ) => ({
              index: <span>{index + 1}</span>,

              user: <User name={`${name} ${lastName ?? ""}`} email={email} />,

              edit: (
                <div className={styles.teachers__edit}>
                  <Button
                    icon={<EditIcon />}
                    style="light"
                    onClick={onEditTeacher.bind(this, {
                      email,
                      id,
                      name,
                      role,
                      uid,
                      loading,
                      courses,
                      lastName,
                    })}
                  />

                  <Button
                    icon={loading ? <LoadingIcon /> : <TrashIcon />}
                    style="danger"
                    onClick={async () => {
                      await deleteTeacher(uid, id);
                    }}
                  />
                </div>
              ),
            })
          )}
          actions={
            <Button
              text="Shto Pedagog"
              icon={<PlusIcon />}
              onClick={async () => {
                setIsEdit(false);
                setModal(true);

                await fetchCourses();
              }}
            />
          }
        />
      )}

      <Modal visible={modal} setVisible={setModal}>
        <div className={styles.modal__content}>
          <h3 className={styles.modal__header}>
            {isEdit ? "Edito Pedagog" : "Shto Pedagog"}
          </h3>

          <form onSubmit={onAddTeacher} className={styles.modal__form}>
            <Input
              type="text"
              label="Emri"
              placeholder="Shkruani emrin e pedagogut"
              elRef={nameEl}
              error={validName}
              onChange={onChangeName}
            />

            <Input
              type="text"
              label="Email"
              placeholder="Shkruani emailin e pedagogut"
              elRef={emailEl}
              error={validEmail}
              disabled={!!isEdit}
              onChange={() => (validEmail ? setValidEmail(null) : null)}
            />

            <Input
              type="text"
              label="Fjalëkalimi"
              placeholder="Shkruani fjalëkalimin e pedagogut"
              elRef={passwordEl}
              error={validPassword}
              disabled={!!isEdit}
              onChange={() => (validPassword ? setValidPassword(null) : null)}
            />

            <div className={styles.form__courses}>
              <label htmlFor="courses-list" className={styles.courses__label}>
                Degët
              </label>

              <ul className={styles.courses__list} id="courses-list">
                {!loadingCourseList &&
                  coursesList.length > 0 &&
                  coursesList
                    .sort((a, b) => a.course.localeCompare(b.course))
                    .map((item) => (
                      <li
                        key={item.id}
                        onClick={onCheckCourse.bind(this, item.id as string)}
                      >
                        <Button
                          text={
                            <div className={styles.item__details}>
                              <h4 className={styles.item__name}>
                                {item.course}
                              </h4>
                              <p className={styles.item__subjects}>
                                {item.subjects
                                  .map((item) => item.value)
                                  .join(", ")}
                              </p>
                            </div>
                          }
                          icon={<Checkbox checked={item.checked as boolean} />}
                          style="light"
                          type="button"
                        />
                      </li>
                    ))}
              </ul>

              {loadingCourseList && (
                <div className={styles.loading}>
                  <LoadingIcon />
                </div>
              )}
            </div>

            <Button
              text={isEdit ? "Ruaj Ndryshimet" : "Shto pedagogun"}
              type="submit"
              className={styles.form__submit}
              icon={
                addTeacherLoading ? (
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

export default TeachersPage;
