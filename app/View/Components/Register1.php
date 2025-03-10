<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Register1 extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct(Request $request)
    {
        # Чтобы получить полный URL для входящего запроса, можно использовать методы url или fullUrl. 
        # Метод url вернет URL без строки запроса, а метод fullUrl, включая строку запроса:
        $this->locationString = $request->url();
        dd($request->url());
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        $locationString = $this->locationString;

    
        // определяем переменные, которые будем использовать в форме, и устанавливаем им первоначально пустые значения:
        $name    = $surName    = $persTelNum    = $persEmail    = $persAddr    = $email    = $dateOfBirth = $emailPosted = $login = $password = $confirm = "";
        $nameErr = $surNameErr = $persTelNumErr = $persEmailErr = $persAddrErr = $emailErr = $dateOfBirthErr = $loginErr = $passwordErr = $confirmErr = "";
        
        $nameOrg    = $innOrg    = $addrOrg    = $telNumOrg    = $emailOrg    = $contrSurNameOrg    = $contrNameOrg    = $contrPatronNameOrg    = 
        $contrPosOrg    = $contrJustOrg     = $bankaccOrg    = $bicBankOrg    = $contrAddInfoOrg    = '';
    
        $nameOrgErr = $innOrgErr = $addrOrgErr = $telNumOrgErr = $emailOrgErr = $contrSurNameOrgErr = $contrNameOrgErr = $contrPatronNameOrgErr = 
        $contrPosOrgErr = $contrJustOrgErr = $bankaccOrgErr = $bicBankOrgErr = $contrAddInfoOrgErr = '';
    
        /*-------------------------------------------------------------------------------------------------------------------
        // соль + пароль: соль для каждого пользователя будет разной и генерироваться случайным образом в момент регистрации.
        // функция, которая будет это делать:
        -------------------------------------------------------------------------------------------------------------------*/
        function generateSalt() {
            $salt = '';
            $saltLength = 16; // длина соли
                
            for($i = 0; $i < $saltLength; $i++) {
                $salt .= chr(mt_rand(33, 126)); // символ из ASCII-table
            }
            return $salt;
        }
        // mt_rand — Генерирует случайное значение методом с помощью генератора простых чисел на базе Вихря Мерсенна. mt_rand(int $min, int $max): int
        // chr — Генерирует односимвольную строку по заданному числу
        
    
        if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['regsubbtn'])) {
            if (!empty($_POST['name'])) {
                $namePosted = $_POST['name'];
                if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $namePosted)) {
                    $namePosted = $sqlMethods->test_input($namePosted);
                    if(mb_strlen($namePosted) < 31) {
                        $name = mysqli_real_escape_string($connect, $namePosted); 
                    } else {
                        $nameErr = 'Длина имени по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                    }
                } else {
                    $nameErr = 'Пожалуйста, укажите имя на русском языке';
                }  
            } else {
                $nameErr = 'Поле обязательно для заполнения';
            }
    
            if (!empty($_POST['surname'])) {
                $surNamePosted = $_POST['surname'];
                if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $surNamePosted)) {
                    $surNamePosted = $sqlMethods->test_input($surNamePosted);
                    if(mb_strlen($surNamePosted) < 31) {
                        $surName = mysqli_real_escape_string($connect, $surNamePosted);
                    } else {
                        $surNameErr = 'Длина фамилии по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                    }
                } else {
                    $surNameErr = 'Пожалуйста, укажите фамилию на русском языке';
                }  
            } else {
                $surNameErr = 'Поле обязательно для заполнения';
            }
    
            if (!empty($_POST['perstelnum'])) {
                $persTelNumPosted = $_POST['perstelnum'];
                if(preg_match("#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#", $persTelNumPosted)) {
                    $persTelNumPosted = $sqlMethods->test_input($persTelNumPosted);
                    $persTelNum = mysqli_real_escape_string($connect, $persTelNumPosted);
                } else {
                    $persTelNumErr = 'Пожалуйста, укажите номер телефона в указанном формате.';
                }  
            } else {
                $persTelNumErr = 'Поле обязательно для заполнения';
            }
           
            if (!empty($_POST['persemail'])) {
                $persEmailPosted = strtolower($sqlMethods->test_input($_POST['persemail']));
                if (preg_match("/^[A-Za-z0-9]+\_*\.?[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z0-9]+$/", $persEmailPosted)) {
                    $queryQniqEmailForPers = "SELECT email_addr FROM logins WHERE email_addr = '$persEmailPosted'";
                    $user = $model -> findOne($queryQniqEmailForPers);
                    if (empty($user)) {
                        $persEmail = $persEmailPosted;
                    } else {
                        if(!isset($_POST['org'])) {
                            // если регистрируется физическое лицо, email будет использоваться в качестве логина. Адрес для логина должен быть уникальным! 
                            $persEmailErr = 'Пользователь с данным email уже зарегистрирован в системе. Пожалуйста, авторизуйтесь.'; 
                        } else {
                            $persEmail = $persEmailPosted; // если в таблице logins есть дубликат и регистрируется организация, то этот email-адрес будет записан для представителя лица в качестве варианта связи с ним, НЕ ДЛЯ ЛОГИНА - в качестве логина будет использоваться почта организации
                        }
                    }
                } else {
                    $persEmailErr = 'Введён некорректный формат адреса электронной почты!'; 
                }
            } else {
                $persEmailErr = 'Поле обязательно для заполнения';
            }
    
            if (!empty($_POST['persaddress'])) {
                $persAddrPosted = $_POST['persaddress'];
                if(preg_match("#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u", $persAddrPosted)) {
                    $persAddrPosted = $sqlMethods->test_input($persAddrPosted);
                    if(mb_strlen($persAddrPosted) < 256) {
                        $persAddr = mysqli_real_escape_string($connect, $persAddrPosted);
                    } else {
                        $persAddrErr = 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                    }
                } else {
                    $persAddrErr = 'Пожалуйста, укажите корректный адрес на русском языке';
                }  
            } 
    
            if(!empty ($_POST['dateOfBirth']) ) {
                $dateOfBirthPosted = $_POST['dateOfBirth'];
                //var_dump($dateOfBirthPosted);
                if(preg_match("#^((19[5-9][0-9])|(20[0-1][0-9]))-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$#", $dateOfBirthPosted)) {
                    $dateOfBirth = $sqlMethods->test_input($dateOfBirthPosted);
                } else {
                    $dateOfBirthErr = 'Непохоже на то, что вы вводите дату своего рождения... Если уверены в своей правоте, - пожалуйста, оставьте поле пока пустым и напишите нам об ошибке.';
                }  
            }
    /*
            if (!empty($_POST["login"])) {
                $loginPosted = $_POST["login"];
                if (preg_match("/^[A-Za-z0-9]+$/", $loginPosted) and strlen($loginPosted) >= 4 and strlen($loginPosted) <= 24 ) {
                    $query = "SELECT login FROM users WHERE login='$loginPosted'";
                    $user = $model -> findOne($query);
                    if (empty($user)) {
                        $login = $loginPosted;
                    } else {
                        $loginErr = 'Логин уже используется. Авторизуйтесь или попробуйте другой!'; 
                    }
                } else $loginErr = 'Логин должен быть длиной от 4 до 24 символов, содержать только латинские буквы и цифры.';   
            } else {
                $loginErr = 'Поле обязательно для заполнения';
            }
    */
            $salt = generateSalt();     // - для пароля не используем метод md5 - используем password_hash, соль записываем в базу в момент регистрации... на всякий случай...
            $salt = $sqlMethods->test_input($salt);
            $salt = mysqli_real_escape_string($connect, $salt);
    
    
            if (!empty ($_POST['password'])) {
                //$password = md5($salt.$_POST['password']);
                // md5 - считается устаревшим способом - сокращаем выполненную выше функцию function generateSalt()  до:
                $passwordPosted = $_POST['password'];
                $passwordPosted = $sqlMethods->test_input($passwordPosted);
                $passwordPosted = mysqli_real_escape_string($connect, $passwordPosted);
                $password = password_hash($passwordPosted, PASSWORD_DEFAULT);
                if(!$password) {
                    $passwordErr = 'Вводимые данные не подлежат обработке.'; 
                }
            } else {
                $passwordErr = 'Поле не может быть пустым.'; 
            }
    
            if (!empty ($_POST['confirm'])) {
                // $confirm = md5($salt.$_POST['confirm']);
                // $confirm = password_hash($_POST['confirm'], PASSWORD_DEFAULT); // солёные и хешированные пароль и подтверждение будут разными - пока комментируем
                $confirmPosted = $_POST['confirm'];
                $confirmPosted = $sqlMethods->test_input($confirmPosted);
                $confirmation = mysqli_real_escape_string($connect, $confirmPosted);
                if(!$confirmation) {
                    $confirmErr = 'Вводимые данные не подлежат обработке.'; 
                }
            } else {
                $confirmErr = 'Поле не может быть пустым.'; 
            }
    
            if(isset($_POST['org']) && isset($_POST['regsubbtn'])) {
                if (!empty($_POST['name_of_org'])) {
                    $nameOrgPosted = $_POST['name_of_org'];
                    if(preg_match("#^[a-zA-Zа-яА-ЯёЁ\d\s'\.,\"\!:\)\(\/№-]+$#u", $nameOrgPosted)) {
                        $nameOrgPosted = $sqlMethods->test_input($nameOrgPosted);
                        if(mb_strlen($nameOrgPosted) < 256) {
                            $nameOrg = mysqli_real_escape_string($connect, $nameOrgPosted); 
                        } else {
                            $nameOrgErr = 'Длина наименования организации по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $nameOrgErr = 'Похоже, что вы использовали специальный символ, который мы не можем обработать';
                    }  
                } else {
                    $nameOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($_POST['inn_of_org'])) {
                    $innOrgPosted = $_POST['inn_of_org'];
                    //var_dump(strlen($innOrgPosted));
                    if(preg_match("#^\d{10,12}$#", $innOrgPosted)) {
                        $innOrgPosted = $sqlMethods->test_input($innOrgPosted);
                        $innOrgPosted = mysqli_real_escape_string($connect, $innOrgPosted); 
                        $queryQniqINNForOrgs = "SELECT org_inn FROM orgs WHERE org_inn = '$innOrgPosted'";
                        $user = $model -> findOne($queryQniqINNForOrgs);
                        if (empty($user)) {
                            $innOrg = $innOrgPosted;
                        } else {
                            $innOrgErr = 'Пользователь с таким ИНН уже зарегистрирован в системе. Пожалуйста, авторизуйтесь.'; 
                        }
                    } else {
                        $innOrgErr = 'Похоже, что вы использовали специальный символ, который мы не можем обработать';
                    }  
                } else {
                    $innOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($_POST['registerOrgAddr'])) {
                    $orgAddrPosted = $_POST['registerOrgAddr'];
                    if(preg_match("#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u", $orgAddrPosted)) {
                        $orgAddrPosted = $sqlMethods->test_input($orgAddrPosted);
                        if(mb_strlen($orgAddrPosted) < 256) {
                            $addrOrg = mysqli_real_escape_string($connect, $orgAddrPosted);
                        } else {
                            $addrOrgErr = 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $addrOrgErr = 'Пожалуйста, укажите корректный адрес на русском языке';
                        //var_dump($orgAddrPosted);
                    }  
                }  else {
                    $addrOrgErr = 'Поле обязательно для заполнения';
                }
            
                if (!empty($_POST['regorgtel'])) {
                    $orgTelNumPosted = $_POST['regorgtel'];
                    if(preg_match("#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#", $orgTelNumPosted)) {
                        $orgTelNumPosted = $sqlMethods->test_input($orgTelNumPosted);
                        $telNumOrg = mysqli_real_escape_string($connect, $orgTelNumPosted);
                    } else {
                        $telNumOrgErr = 'Пожалуйста, укажите номер телефона в указанном формате.';
                    }  
                } else {
                    $telNumOrgErr = 'Поле обязательно для заполнения';
                }
               
                if (!empty($_POST['regorgemail'])) {
                    $orgEmailPosted = strtolower($sqlMethods->test_input($_POST['regorgemail']));
    
                    if (preg_match("/^[A-Za-z0-9]+\_*\.?[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z0-9]+$/", $orgEmailPosted)) {
                        $queryUniqOrgEmailForLogin = "SELECT email_addr FROM logins WHERE email_addr = '$orgEmailPosted'";
                        $orgEmailLogin = $model -> findOne($queryUniqOrgEmailForLogin);
                        if (empty($orgEmailLogin)) {
                            $emailOrg = $orgEmailPosted;
                        } else {
                            $emailOrgErr = 'Пользователь с данным email уже зарегистрирован в системе. Пожалуйста, авторизуйтесь.'; 
                        }
                    } else {
                        $emailOrgErr = 'Введён некорректный формат адреса электронной почты!'; 
                    }
                } else {
                    $emailOrgErr = 'Поле обязательно для заполнения';
                }
            }
    
    
            if(isset($_POST['orgneedsregularcontract']) && isset($_POST['regsubbtn'])) {
                if (!empty($_POST['contract_surname'])) {
                    $contrSurNamePosted = $_POST['contract_surname'];
                    if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $contrSurNamePosted)) {
                        $contrSurNamePosted = $sqlMethods->test_input($contrSurNamePosted);
                        if(mb_strlen($contrSurNamePosted) < 31) {
                            $contrSurNameOrg = mysqli_real_escape_string($connect, $contrSurNamePosted);
                        } else {
                            $contrSurNameOrgErr = 'Длина фамилии по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $contrSurNameOrgErr = 'Пожалуйста, укажите фамилию на русском языке';
                    }  
                } else {
                    $contrSurNameOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($_POST['contract_name'])) {
                    $contrNamePosted = $_POST['contract_name'];
                    if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $contrNamePosted)) {
                        $contrNamePosted = $sqlMethods->test_input($contrNamePosted);
                        if(mb_strlen($contrNamePosted) < 31) {
                            $contrNameOrg = mysqli_real_escape_string($connect, $contrNamePosted);
                        } else {
                            $contrNameOrgErr = 'Длина имени по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $contrNameOrgErr = 'Пожалуйста, укажите имя на русском языке';
                    }  
                } else {
                    $contrNameOrgErr = 'Поле обязательно для заполнения';
                }
            
                if (!empty($_POST['contract_patronymic'])) {
                    $contrPatronNamePosted = $_POST['contract_patronymic'];
                    if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $contrPatronNamePosted)) {
                        $contrPatronNamePosted = $sqlMethods->test_input($contrPatronNamePosted);
                        if(mb_strlen($contrPatronNamePosted) < 31) {
                            $contrPatronNameOrg = mysqli_real_escape_string($connect, $contrPatronNamePosted);
                        } else {
                            $contrPatronNameOrgErr = 'Длина отчества по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $contrPatronNameOrgErr = 'Пожалуйста, укажите отчество на русском языке';
                    }  
                } else {
                    $contrPatronNameOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($_POST['contract_position'])) {
                    $contrPosOrgPosted = $_POST['contract_position'];
                    if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $contrPosOrgPosted)) {
                        $contrPosOrgPosted = $sqlMethods->test_input($contrPosOrgPosted);
                        if(mb_strlen($contrPosOrgPosted) < 31) {
                            $contrPosOrg = mysqli_real_escape_string($connect, $contrPosOrgPosted);
                        } else {
                            $contrPosOrgErr = 'Длина наименования должности по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $contrPosOrgErr = 'Пожалуйста, укажите должность лица, подписывающего договор, на русском языке';
                    }  
                } else {
                    $contrPosOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($_POST['contract_justification'])) {
                    $contrJustOrgPosted = $_POST['contract_justification'];
                    if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $contrJustOrgPosted)) {
                        $contrJustOrgPosted = $sqlMethods->test_input($contrJustOrgPosted);
                        if(mb_strlen($contrJustOrgPosted) < 31) {
                            $contrJustOrg = mysqli_real_escape_string($connect, $contrJustOrgPosted);
                        } else {
                            $contrJustOrgErr = 'Длина наименования документа по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $contrJustOrgErr = 'Пожалуйста, укажите документ-основание для лица, подписывающего договор, на русском языке';
                    }  
                } else {
                    $contrJustOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($_POST['bankaccount_of_org'])) {
                    $bankaccOrgPosted = $_POST['bankaccount_of_org'];
                    if(preg_match("#^\d{20}$#", $bankaccOrgPosted)) {
                        $bankaccOrgPosted = $sqlMethods->test_input($bankaccOrgPosted);
                        $bankaccOrg = mysqli_real_escape_string($connect, $bankaccOrgPosted); 
                    } else {
                        $bankaccOrgErr = 'Похоже, что вы использовали специальный символ, который мы не можем обработать';
                    }  
                } else {
                    $bankaccOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($_POST['bicbank_of_org'])) {
                    $bicBankOrgPosted = $_POST['bicbank_of_org'];
                    if(preg_match("#^\d{9}$#", $bicBankOrgPosted)) {
                        $bicBankOrgPosted = $sqlMethods->test_input($bicBankOrgPosted);
                        $bicBankOrg = mysqli_real_escape_string($connect, $bicBankOrgPosted); 
                    } else {
                        $bicBankOrgErr = 'БИК банка состоит из 9-ти цифр.';
                    }  
                } else {
                    $bicBankOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($_POST['contract_addition'])) {
                    $contrAddInfoOrgted = $_POST['contract_addition'];
                    if(preg_match("#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u", $contrAddInfoOrgted)) {
                        $contrAddInfoOrgted = $sqlMethods->test_input($contrAddInfoOrgted);
                        if(mb_strlen($contrAddInfoOrgted) < 256) {
                            $contrAddInfoOrg = mysqli_real_escape_string($connect, $contrAddInfoOrgted);
                        } else {
                            $contrAddInfoOrgErr = 'Похоже, что много всего написано! Если мы ошибаемся, - оставьте пока поле пустым. Пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $contrAddInfoOrgErr = 'Пожалуйста, укажите информацию на русском языке';
                    }  
                }
            }
    
    
            # случай №1: когда регистрируется физическое лицо (делаем проверку в условии, что !isset($_POST['org']) and !isset($_POST['orgneedsregularcontract']):
            if (!empty($name) and !empty($surName) and !empty($persTelNum) and !empty($persEmail) and empty($persAddrErr)  
                and empty($dateOfBirthErr) and !empty($password) and empty($passwordErr) and empty($confirmErr) 
                and !empty($confirmation) and !isset($_POST['org']) and !isset($_POST['orgneedsregularcontract'])) {
    
                if ($passwordPosted == $confirmation) {
            
                /* сейчас делаем такую модель:
                    - если для физлица заполнены имя, фамилия, телефон, email и не введены сомнительные данные (есть ошибки) в 
                    необязательные для заполнения поля: адрес, дата рождения ... 
                    1) сначала проверяем есть ли такой email в базе, если нет - записываем email в таблицу logins, получаем id 
                    2) заносим физлицо в таблицу users и получаем его id
                    3) обновляем таблицу logins: прописываем client_email_id
                */
    
                $newLogin = new project\classes\Login($persEmail, 1);
                $persLoginId = $newLogin->getLoginId();
            
                // Создаём новый объект класса Person
                $newPerson = (new project\classes\Person)->setTypeId(1)->setRankId(1)->setAccessId(1)->setName($name)->setSurname($surName)->setTel($persTelNum)->setEmail($persEmail)->setPassword($password)->setSalt($salt)->setDateOfBirth($dateOfBirth)->setLoginId($persLoginId)->setAddress($persAddr)->setAuthId(0);
                
                $idNewUser = $newPerson->addNewPersoninToTheTable()->getId();   // вносим в БД новую запись и получаем id этой записи
                   
                $newLogin->updateClientId($idNewUser);
    
                $_SESSION['auth'] = true; // пометка об авторизации
                $_SESSION['user_type'] = 1;
                $_SESSION['id'] = $idNewUser;
                $_SESSION['flash'] = "Добро пожаловать, $name!"; // не работает
                $_SESSION['user_status'] = '1'; // пометка о статусе зарегистрированного пользователя 
                $_SESSION['name'] = $name;
    
                header("Location: $locationString");
    
                } else {
                    $confirmErr = 'Ведённые вами пароли не совпадают!';
                }
            } 
    
            # случай №2: когда регистрируется юридическое лицо, которому пока не нужен договор (делаем проверку в условии, что isset($_POST['org']) and !isset($_POST['orgneedsregularcontract']):      
            if (!empty($name) and !empty($surName) and !empty($persTelNum) and !empty($persEmail) and empty($persAddrErr)  
                and empty($dateOfBirthErr) and !empty($password) and empty($passwordErr) and empty($confirmErr) 
                and !empty($confirmation) and isset($_POST['org']) and !empty($nameOrg) and !empty($innOrg) and !empty($addrOrg) 
                and !empty($telNumOrg) and !empty($emailOrg) and !isset($_POST['orgneedsregularcontract'])) {
    
                if ($passwordPosted == $confirmation) {
    
                $isTaxesPay = 0;
                if(isset($_POST['orgvatpayer'])) { $isTaxesPay = 1; }
            
                /* сейчас делаем такую модель:
                    1) сначала проверяем есть ли такой email в базе, если нет - записываем email в таблицу logins, получаем id 
                    2) заносим физлицо (качестве представителя компании) в таблицу pers и получаем его id
                    3) обновляем таблицу logins: прописываем client_email_id
                */
    
                // Создаём новый объект класса Person setRankId(10) - org_repres setAccessId(6)->guest
                $newPerson = (new project\classes\Person)->setTypeId(1)->setRankId(10)->setAccessId(6)->setName($name)->setSurname($surName)->setTel($persTelNum)->setEmail($persEmail)->setPassword('')->setSalt('')->setDateOfBirth($dateOfBirth)->setLoginId(0)->setAddress($persAddr)->setAuthId(0);
                $idNewPerson = $newPerson->addNewPersoninToTheTable()->getId();   // вносим в БД новую запись и получаем id этой записи
    
                $newLogin = new project\classes\Login($emailOrg, 2);
                $orgLoginId = $newLogin->getLoginId();
    
                // Создаём новый объект класса Company
                $newCompany = (new project\classes\Company)->setTypeId(2)->setRankId(1)->setAccessId(1)->setName($nameOrg)->setInn($innOrg)->setIsTaxesPay($isTaxesPay)->setContactPersonId($idNewPerson)->
                setTel($telNumOrg)->setEmail($emailOrg)->setPassword($password)->setSalt($salt)->setLoginId($orgLoginId)->setAddress($addrOrg)->setRepresName('')->setRepresSurname('')->
                setRepresPatronymic('')->setRepresPosition('')->setRepresJustification('')->setBankAcc(0)->setBankBic(0)->setAddInfo('')->setAuthId(0);
                $idNewCompany = $newCompany->addNewCompanyinToTheTable()->getId();   // вносим в БД новую запись и получаем id этой записи
                   
                $newLogin->updateClientId($idNewCompany);
    
                $_SESSION['auth'] = true; // пометка об авторизации
                $_SESSION['user_type'] = 2;
                $_SESSION['id'] = $idNewCompany;
                $_SESSION['flash'] = "Добро пожаловать!"; // не работает
                $_SESSION['user_status'] = '1'; // пометка о статусе зарегистрированного пользователя 
                $_SESSION['name'] = 'ЮрЛицо';
    
                header("Location: $locationString");
    
                } else {
                    $confirmErr = 'Ведённые вами пароли не совпадают!';
                }
            } 
    
            # случай №3: когда регистрируется юридическое лицо, которому нужен договор (делаем проверку в условии, что isset($_POST['org']) and isset($_POST['orgneedsregularcontract']):      
            if (!empty($name) and !empty($surName) and !empty($persTelNum) and !empty($persEmail) and empty($persAddrErr)  
                and empty($dateOfBirthErr) and !empty($password) and empty($passwordErr) and empty($confirmErr) 
                and !empty($confirmation) and isset($_POST['org']) and !empty($nameOrg) and !empty($innOrg) and !empty($addrOrg) 
                and !empty($telNumOrg) and !empty($emailOrg) and isset($_POST['orgneedsregularcontract']) and !empty($contrNameOrg) and !empty($contrSurNameOrg)
                and !empty($contrPatronNameOrg) and !empty($contrPosOrg) and !empty($contrJustOrg) and !empty($bankaccOrg) and !empty($bicBankOrg) and empty($contrAddInfoOrgErr)) {
    
                if ($passwordPosted == $confirmation) {
    
                $isTaxesPay = 0;
                if(isset($_POST['orgvatpayer'])) { $isTaxesPay = 1; }
            
                /* сейчас делаем такую модель:
                    1) сначала проверяем есть ли такой email в базе, если нет - записываем email в таблицу logins, получаем id 
                    2) заносим физлицо (качестве представителя компании) в таблицу pers и получаем его id
                    3) обновляем таблицу logins: прописываем client_email_id
                */
    
                // Создаём новый объект класса Person setRankId(10) - org_repres setAccessId(6)->guest
                $newPerson = (new project\classes\Person)->setTypeId(1)->setRankId(10)->setAccessId(6)->setName($name)->setSurname($surName)->setTel($persTelNum)->setEmail($persEmail)->setPassword('')->setSalt('')->setDateOfBirth($dateOfBirth)->setLoginId(0)->setAddress($persAddr)->setAuthId(0);
                $idNewPerson = $newPerson->addNewPersoninToTheTable()->getId();   // вносим в БД новую запись и получаем id этой записи
    
                $newLogin = new project\classes\Login($emailOrg, 2);
                $orgLoginId = $newLogin->getLoginId();
    
                // Создаём новый объект класса Company
                var_dump($contrNameOrg);
                $newCompany = (new project\classes\Company)->setTypeId(2)->setRankId(1)->setAccessId(1)->setName($nameOrg)->setInn($innOrg)->setIsTaxesPay($isTaxesPay)->setContactPersonId($idNewPerson)->
                setTel($telNumOrg)->setEmail($emailOrg)->setPassword($password)->setSalt($salt)->setLoginId($orgLoginId)->setAddress($addrOrg)->setRepresName($contrNameOrg)->setRepresSurname($contrSurNameOrg)->
                setRepresPatronymic($contrPatronNameOrg)->setRepresPosition($contrPosOrg)->setRepresJustification($contrJustOrg)->setBankAcc($bankaccOrg)->setBankBic($bicBankOrg)->setAddInfo($contrAddInfoOrg)->setAuthId(0);
                $idNewCompany = $newCompany->addNewCompanyinToTheTable()->getId();   // вносим в БД новую запись и получаем id этой записи
                   
                $newLogin->updateClientId($idNewCompany);
    
                $_SESSION['auth'] = true; // пометка об авторизации
                $_SESSION['user_type'] = 2;
                $_SESSION['id'] = $idNewCompany;
                $_SESSION['flash'] = "Добро пожаловать, Организация!"; // не работает
                $_SESSION['user_status'] = '1'; // пометка о статусе зарегистрированного пользователя 
                $_SESSION['name'] = 'ЮрЛицо';
    
                header("Location: $locationString");
    
                } else {
                    $confirmErr = 'Ведённые вами пароли не совпадают!';
                }
            } 
        }
   
    



        return view('components.register', [
            'locationString' => $locationString,
        ]);
    }
}