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

import { Course, UserItem, UserRole } from "@interface/context";

import Layout from "@components/Layout";
import PaymentCard, { PaymentItem } from "@components/PaymentCard";
import Seo from "@components/Seo";
import { Button, Checkbox, Input, Modal, Select, Table, User } from "@ui";
import { EditIcon, LoadingIcon, PlusIcon, TrashIcon } from "@icon";

import { db, deleteUser, registerWithEmailAndPassword } from "@utils/firebase";
import { validateEmail } from "@utils/helper";

import * as styles from "@styles/pages/students.module.scss";

const StudentsPage: React.FC = () => {
  const [modal, setModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [addUserLoading, setAddUserLoading] = useState<boolean>(false);
  const [studentsList, setStudentsList] = useState<UserItem[]>([]);

  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loadingCourseList, setLoadingCourseList] = useState<boolean>(false);

  const [userData, setUserData] = useState<Partial<UserItem>>({});
  const [isEdit, setIsEdit] = useState<false | string>(false);

  const [formErrors, setFormErrors] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  const fetchStudents = async () => {
    try {
      const docs = await getDocs(
        query(collection(db, "users"), where("role", "==", "student"))
      );

      if (docs.docs.length > 0) {
        const students = docs.docs.map((item) => ({
          ...item.data(),
          id: item.id,
        })) as UserItem[];

        setStudentsList(students);
      }
    } catch (error) {
      // console.log(error);
    }

    setLoading(false);
  };

  const deleteStudent = async (uid: string, docId: string) => {
    try {
      setStudentsList((prevState) =>
        prevState.map((student) =>
          student.uid === uid ? { ...student, loading: true } : student
        )
      );

      await deleteUser(uid, docId, true);

      setStudentsList((prevState) =>
        prevState.filter((student) => student.uid !== uid)
      );
    } catch (error) {
      // console.log(error);
    }
  };

  const onAddUser: React.FormEventHandler<HTMLFormElement> = async (form) => {
    form.preventDefault();

    let failed: boolean = false;

    if (!userData.email?.trim()) {
      setFormErrors((prevState) => ({
        ...prevState,
        email: true,
      }));
      failed = true;
    }

    if (!isEdit && !userData.password?.trim()) {
      setFormErrors((prevState) => ({
        ...prevState,
        password: true,
      }));
      failed = true;
    }

    if (failed) return;

    setAddUserLoading(true);

    const paymentCleanUp: PaymentItem[] = (userData.payments ?? [])?.map(
      (item) =>
        ({
          id: item.id,
          payments: item.payments,
          cost: item.cost ?? null,
          discount: item.discount ?? null,
          done: item.done ?? null,
          euro: item.euro ?? null,
          expire: {
            cost: item.expire?.cost ?? null,
            enabled: item.expire?.enabled ?? null,
            endDate: item.expire?.endDate ?? null,
            startDate: item.expire?.startDate ?? null,
          },
          startDate: item.startDate ?? null,
        } as PaymentItem)
    );

    try {
      if (isEdit) {
        try {
          await updateDoc(doc(db, "users", isEdit), {
            name: userData.name ?? "",
            lastName: userData.lastName ?? "",
            fatherName: userData.fatherName ?? "",
            payments: paymentCleanUp,
            matriculation: userData.matriculation ?? "",
            password: userData.password ?? "",
            birthDay: userData.birthDay ?? "",
            gender: !!userData.gender,
            isMarried: !!userData.isMarried,
            birthplace: userData.birthplace ?? "",
            location: userData.location ?? "",
            phone: userData.phone ?? "",
            highSchool: userData.highSchool ?? "",
            highSchoolID: userData.highSchoolID ?? "",
            cardID: userData.cardID ?? "",
            alName: userData.alName ?? "",
            transferAlName: userData.transferAlName ?? "",
            prevMatriculation: userData.prevMatriculation ?? "",
            registerDate: userData.registerDate ?? "",
          });

          setStudentsList((prevState) =>
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
          console.log(error);
        }
      } else {
        try {
          const uid = await registerWithEmailAndPassword({
            email: userData.email ?? "",
            name: `${userData.name} ${userData.lastName ?? ""}`,
            password: userData.password ?? "",
          });

          if (uid) {
            const user = await addDoc(collection(db, "users"), {
              email: userData.email,
              name: userData.name ?? "",
              lastName: userData.lastName ?? "",
              role: "student",
              uid,
              payments: paymentCleanUp,
              fatherName: userData.fatherName ?? "",
              matriculation: userData.matriculation ?? "",
              password: userData.password,
              birthDay: userData.birthDay ?? "",
              gender: !!userData.gender,
              isMarried: !!userData.isMarried,
              birthplace: userData.birthplace ?? "",
              location: userData.location ?? "",
              phone: userData.phone ?? "",
              highSchool: userData.highSchool ?? "",
              highSchoolID: userData.highSchoolID ?? "",
              cardID: userData.cardID ?? "",
              alName: userData.alName ?? "",
              transferAlName: userData.transferAlName ?? "",
              prevMatriculation: userData.prevMatriculation ?? "",
              registerDate: userData.registerDate ?? "",
            });

            setStudentsList((prevState) => [
              ...prevState,
              { ...userData, uid, id: user.id } as UserItem,
            ]);
          }
        } catch (error) {
          console.log(error);
        }
      }

      setModal(false);
    } catch (error) {
      // console.log(error);
    }

    setAddUserLoading(false);
  };

  const onCheckCourse = (id: string) => {
    setCoursesList((prevState) =>
      prevState.map((item) => ({
        ...item,
        checked: item.id === id ? !item.checked : item.checked,
      }))
    );

    setUserData((prevState) => ({
      ...prevState,
      payments: (() => {
        const fullList = prevState?.payments ?? [];

        const paymentItem = fullList.find((e) => e.id === id);

        if (paymentItem) {
          return fullList.filter((e) => e.id !== id);
        }

        return [
          ...fullList,
          {
            id,
            payments: [],
          },
        ];
      })(),
    }));
  };

  const onRemovePayment = (id: string, index: number) => {
    setUserData((prevState) => ({
      ...prevState,
      payments: (prevState.payments ?? []).map((item) => {
        if (item.id === id) {
          return {
            ...item,
            payments: item.payments.filter((i, idx) => idx !== index),
          };
        }

        return item;
      }),
    }));
  };

  const fetchCourses = useCallback(async (studentsCourses?: string[]) => {
    setLoadingCourseList(true);

    try {
      const docs = await getDocs(query(collection(db, "courses")));

      if (docs.docs.length > 0) {
        const courses = docs.docs.map((item) => ({
          ...item.data(),
          id: item.id,
          checked: false,
        })) as Course[];

        if (studentsCourses) {
          const coursesMap: {
            [x: string]: boolean;
          } = {};

          studentsCourses.forEach((item) => {
            coursesMap[item] = true;
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

  const onEditStudent = async (userPayload: UserItem) => {
    setModal(true);

    await fetchCourses(userPayload.payments?.map((e) => e.id));

    setIsEdit(userPayload.id);
    setUserData(userPayload);
  };

  useEffect(() => {
    if (!modal) {
      setIsEdit(false);
      setUserData({});
    }
  }, [modal]);

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <Layout>
      <Seo title="Studentet" />

      <h1 className={styles.students__title}>Studentet</h1>

      {loading ? (
        <div className={styles.loading}>
          <LoadingIcon />
        </div>
      ) : (
        <Table
          title="Lista e studentëve"
          className={styles.table}
          thead={[
            {
              title: "Nr.",
              key: "index",
            },
            {
              title: "Studenti",
              key: "user",
            },
            {
              title: "Edito",
              key: "edit",
            },
          ]}
          tbody={studentsList
            .sort((a, b) => a.name?.localeCompare(b?.name))
            .map((user, index) => ({
              index: <span>{index + 1}</span>,
              user: (
                <User
                  name={`${user.name} ${user.lastName ?? ""}`}
                  email={user.email}
                />
              ),
              edit: (
                <div className={styles.students__edit}>
                  <Button
                    icon={<EditIcon />}
                    style="light"
                    onClick={onEditStudent.bind(this, user)}
                  />

                  <Button
                    icon={loading ? <LoadingIcon /> : <TrashIcon />}
                    style="danger"
                    onClick={async () => {
                      if (!loading) await deleteStudent(user.uid, user.id);
                    }}
                  />
                </div>
              ),
            }))}
          actions={
            <Button
              text="Shto Student"
              icon={<PlusIcon />}
              onClick={async () => {
                setModal(true);

                await fetchCourses();
              }}
            />
          }
        />
      )}

      <Modal visible={modal} setVisible={setModal} big>
        <div className={styles.modal__content}>
          <h3 className={styles.modal__header}>
            {isEdit ? "Edito Student" : "Shto Student"}
          </h3>

          <form onSubmit={onAddUser} className={styles.modal__form}>
            <div className={styles.grid__list}>
              <Input
                type="text"
                label="Nr. matrikullimi"
                placeholder="Shkruani nr. e  matrikullimi"
                value={userData.matriculation ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    matriculation: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="Emri"
                placeholder="Shkruani emrin e studentit"
                value={userData.name ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    name: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="Atesia"
                placeholder="Shkruani emrin babait te studentit"
                value={userData.fatherName ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    fatherName: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="Mbiemri"
                placeholder="Shkruani mbiemrin e studentit"
                value={userData.lastName ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    lastName: e.target.value,
                  }));
                }}
              />
            </div>

            <div className={styles.grid__list}>
              <Input
                type="date"
                label="Datëlindja"
                value={userData.birthDay ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    birthDay: e.target.value,
                  }));
                }}
              />

              <Select
                label="Gjinia"
                options={[
                  {
                    key: "male",
                    value: "Mashkull",
                  },
                  {
                    key: "female",
                    value: "Femër",
                  },
                ]}
                value={userData.gender ? "male" : "female"}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    gender: e.target.value === "male",
                  }));
                }}
              />

              <Select
                label="Gjendja civile"
                options={[
                  {
                    key: "maried",
                    value: `${userData.gender ? "I" : "E"} Martuar`,
                  },
                  {
                    key: "not-maried",
                    value: `Beqar${userData.gender ? "" : "e"}`,
                  },
                ]}
                value={userData.isMarried ? "maried" : "not-maried"}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    isMarried: e.target.value === "maried",
                  }));
                }}
              />

              <Input
                type="text"
                label="Vendlindja"
                placeholder="Shkruani vendlindjen e studentit"
                value={userData.birthplace ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    birthplace: e.target.value,
                  }));
                }}
              />
            </div>

            <div className={styles.grid__list}>
              <Input
                type="text"
                label="Adresa e vendbanimit në RSH"
                placeholder="Shkruani adresen e studentit"
                value={userData.location ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    location: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="Telefon"
                placeholder="Shkruani nr. e telefonit te studentit"
                value={userData.phone ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    phone: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="Shkolla e mesme"
                placeholder="Shkruani emrin e shkolles e mesme e studentit"
                value={userData.highSchool ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    highSchool: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="ID mature/nr. regjistri të veçantë"
                placeholder="Shkruani id e matures te studentit"
                value={userData.highSchoolID ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    highSchoolID: e.target.value,
                  }));
                }}
              />
            </div>

            <div className={styles.grid__list}>
              <Input
                type="text"
                label="NID"
                placeholder="Shkruani NID te studentit"
                value={userData.cardID ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    cardID: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="IAL ku ka kryer studimet e Ciklit të Parë"
                placeholder="Shkruani emrin e IAL te studentit"
                value={userData.alName ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    alName: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="IAL-ja nga është transferuar"
                placeholder="Shkruani IAL te studentit"
                value={userData.transferAlName ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    transferAlName: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="Numri i matrikullimit të mëparshëm"
                placeholder="Shkruani numrin e matrikullimit te studentit"
                value={userData.prevMatriculation ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    prevMatriculation: e.target.value,
                  }));
                }}
              />
            </div>

            <div className={styles.grid__colss}>
              <Input
                type="text"
                label="Email"
                placeholder="Shkruani emailin e studentit"
                disabled={!!isEdit}
                error={formErrors.email ? "Vendosni një email te saktë" : ""}
                value={userData.email ?? ""}
                onChange={(e) => {
                  setFormErrors((prevState) => ({
                    ...prevState,
                    email: false,
                  }));

                  setUserData((prevState) => ({
                    ...prevState,
                    email: e.target.value,
                  }));
                }}
              />

              <Input
                type="text"
                label="Fjalëkalimi"
                placeholder="Shkruani fjalëkalimin e studentit"
                disabled={!!isEdit}
                value={userData.password ?? ""}
                error={
                  formErrors.password ? "Vendosni një password me te fortë" : ""
                }
                onChange={(e) => {
                  setFormErrors((prevState) => ({
                    ...prevState,
                    password: false,
                  }));

                  setUserData((prevState) => ({
                    ...prevState,
                    password: e.target.value,
                  }));
                }}
              />

              <Input
                type="date"
                label="Data e regjistrimit"
                value={userData.registerDate ?? ""}
                onChange={(e) => {
                  setUserData((prevState) => ({
                    ...prevState,
                    registerDate: e.target.value,
                  }));
                }}
              />
            </div>

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
                          className={styles.course__btn}
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

            <div className={styles.courses__payments}>
              {!loadingCourseList &&
                coursesList.filter((e) => e.checked).length > 0 && (
                  <>
                    <p className={styles.courses__label}>Pagesat</p>

                    <div className={styles.payments__list}>
                      {coursesList
                        .filter((e) => e.checked)
                        .sort((a, b) => a.course.localeCompare(b.course))
                        .map((item) => {
                          const coursePayments = (
                            userData?.payments ?? []
                          ).filter((e) => e.id === (item.id as string));

                          return (
                            <PaymentCard
                              key={item.id}
                              title={`Dega ${item.course?.replace(
                                /[0-9]/g,
                                ""
                              )}${item.year ? ` - Viti i ${item.year}` : ""}`}
                              coursePayments={coursePayments}
                              id={item.id as string}
                              onRemovePayment={onRemovePayment}
                              setUserData={setUserData}
                            />
                          );
                        })}
                    </div>
                  </>
                )}
            </div>

            <Button
              text={isEdit ? "Ruaj Ndryshimet" : "Shto studentin"}
              type="submit"
              className={styles.form__submit}
              icon={
                addUserLoading ? (
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

export default StudentsPage;
