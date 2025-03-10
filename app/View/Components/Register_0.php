<?php
// переименовал файл в ноль, чтобы не мешал: сейчас процесс регистрации должен идти через фотифай... 03.01.2025
namespace App\View\Components;
use Illuminate\Http\Request;                // подключим класс Request
use App\Models\Login;
use App\Models\Person;
use App\Traits\TestInputTrait;
use Illuminate\Http\RedirectResponse;       // Ответы с перенаправлением являются экземплярами класса Illuminate\Http\RedirectResponse и содержат корректные заголовки, необходимые для перенаправления пользователя на другой URL. 

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

use Illuminate\Auth\Events\Registered;      // должны убедиться, что запускаем событие Illuminate\Auth\Events\Registered после успешной регистрации пользователя...

class Register_0 extends Component
{
    use TestInputTrait;
    /**
     * Create a new component instance.
     */
    public function __construct(Request $request)
    {
        # Чтобы получить полный URL для входящего запроса, можно использовать методы url или fullUrl. 
        # Метод url вернет URL без строки запроса, а метод fullUrl, включая строку запроса:
        $this->locationString = $request->url();
        $this->request = $request;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        $locationString = $this->locationString;
        $request = $this->request;
        
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
        
        if (isset($request->regsubbtn) && $request->regsubbtn == 'regsubmit') {
            
            if (!empty($request->name)) {
                $namePosted = $request->name;
                if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $namePosted)) {
                    $namePosted = $this->test_input($namePosted);
                    if(mb_strlen($namePosted) < 31) {
                        // $name = mysqli_real_escape_string($connect, $namePosted); 
                        $name = $namePosted; 
                    } else {
                        $nameErr = 'Длина имени по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                    }
                } else {
                    $nameErr = 'Пожалуйста, укажите имя на русском языке';
                }  
            } else {
                $nameErr = 'Поле обязательно для заполнения';
            }

            if (!empty($request->surname)) {
                $surNamePosted = $request->surname;
                if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $surNamePosted)) {
                    $surNamePosted = $this->test_input($surNamePosted);
                    if(mb_strlen($surNamePosted) < 31) {
                        // $surName = mysqli_real_escape_string($connect, $surNamePosted);
                        $surName = $surNamePosted;
                    } else {
                        $surNameErr = 'Длина фамилии по нашему мнению не может превышать 30 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                    }
                } else {
                    $surNameErr = 'Пожалуйста, укажите фамилию на русском языке';
                }  
            } else {
                $surNameErr = 'Поле обязательно для заполнения';
            }

            if (!empty($request->perstelnum)) {
                $persTelNumPosted = $request->perstelnum;
                if(preg_match("#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#", $persTelNumPosted)) {
                    $persTelNumPosted = $this->test_input($persTelNumPosted);
                    // $persTelNum = mysqli_real_escape_string($connect, $persTelNumPosted);
                    $persTelNum = $persTelNumPosted;
                } else {
                    $persTelNumErr = 'Пожалуйста, укажите номер телефона в указанном формате.';
                }  
            } else {
                $persTelNumErr = 'Поле обязательно для заполнения';
            }

            if (!empty($request->persemail)) {
                $persEmailPosted = strtolower($this->test_input($request->persemail));
                if (preg_match("/^[A-Za-z0-9]+\_*\.?[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z0-9]+$/", $persEmailPosted)) {
                    $user = Login::where('email_addr', $persEmailPosted)->first();
                    if (empty($user)) {
                        $persEmail = $persEmailPosted;
                    } else {
                        if(!isset($request->org)) {
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

            if (!empty($request->persaddress)) {
                $persAddrPosted = $request->persaddress;
                if(preg_match("#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u", $persAddrPosted)) {
                    $persAddrPosted = $this->test_input($persAddrPosted);
                    if(mb_strlen($persAddrPosted) < 256) {
                        // $persAddr = mysqli_real_escape_string($connect, $persAddrPosted);
                        $persAddr = $persAddrPosted;
                    } else {
                        $persAddrErr = 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                    }
                } else {
                    $persAddrErr = 'Пожалуйста, укажите корректный адрес на русском языке';
                }  
            } 

            if(!empty ($request->dateOfBirth) ) {
                $dateOfBirthPosted = $request->dateOfBirth;
                if(preg_match("#^((19[5-9][0-9])|(20[0-1][0-9]))-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])$#", $dateOfBirthPosted)) {
                    $dateOfBirth = $this->test_input($dateOfBirthPosted);
                } else {
                    $dateOfBirthErr = 'Непохоже на то, что вы вводите дату своего рождения... Если уверены в своей правоте, - пожалуйста, оставьте поле пока пустым и напишите нам об ошибке.';
                }  
            }

            $salt = generateSalt();     // - для пароля не используем метод md5 - используем password_hash, соль записываем в базу в момент регистрации... на всякий случай...
            $salt = $this->test_input($salt);
            // $salt = mysqli_real_escape_string($connect, $salt);

            if (!empty ($request->password)) {
                //$password = md5($salt.$_POST['password']);
                // md5 - считается устаревшим способом - сокращаем выполненную выше функцию function generateSalt()  до:
                $passwordPosted = $request->password;
                $passwordPosted = $this->test_input($passwordPosted);
                // $passwordPosted = mysqli_real_escape_string($connect, $passwordPosted);
                $password = password_hash($passwordPosted, PASSWORD_DEFAULT);
                if(!$password) {
                    $passwordErr = 'Вводимые данные не подлежат обработке.'; 
                }
            } else {
                $passwordErr = 'Поле не может быть пустым.'; 
            }

            if (!empty ($request->confirm)) {
                $confirmPosted = $request->confirm;
                $confirmPosted = $this->test_input($confirmPosted);
                // $confirm = mysqli_real_escape_string($connect, $confirmPosted);
                $confirm = $confirmPosted;
                if(!$confirm) {
                    $confirmErr = 'Вводимые данные не подлежат обработке.'; 
                }
            } else {
                $confirmErr = 'Поле не может быть пустым.'; 
            }

            if(isset($request->org) && isset($request->regsubbtn)) {
                if (!empty($request->name_of_org)) {
                    $nameOrgPosted = $request->name_of_org;
                    if(preg_match("#^[a-zA-Zа-яА-ЯёЁ\d\s'\.,\"\!:\)\(\/№-]+$#u", $nameOrgPosted)) {
                        $nameOrgPosted = $this->test_input($nameOrgPosted);
                        if(mb_strlen($nameOrgPosted) < 256) {
                            // $nameOrg = mysqli_real_escape_string($connect, $nameOrgPosted); 
                            $nameOrg = $nameOrgPosted; 
                        } else {
                            $nameOrgErr = 'Длина наименования организации по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $nameOrgErr = 'Похоже, что вы использовали специальный символ, который мы не можем обработать';
                    }  
                } else {
                    $nameOrgErr = 'Поле обязательно для заполнения';
                }
    
                if (!empty($request->inn_of_org)) {
                    $innOrgPosted = $request->inn_of_org;
                    if(preg_match("#^\d{10,12}$#", $innOrgPosted)) {
                        $innOrgPosted = $this->test_input($innOrgPosted);
                        // $innOrgPosted = mysqli_real_escape_string($connect, $innOrgPosted); 
                        $user = Organization::where('org_inn', $innOrgPosted)->first();
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
    
                if (!empty($request->registerOrgAddr)) {
                    $orgAddrPosted = $request->registerOrgAddr;
                    if(preg_match("#^[а-яА-ЯёЁ\d\s.,\"\!:\)\(\/№-]*$#u", $orgAddrPosted)) {
                        $orgAddrPosted = $this->test_input($orgAddrPosted);
                        if(mb_strlen($orgAddrPosted) < 256) {
                            // $addrOrg = mysqli_real_escape_string($connect, $orgAddrPosted);
                            $addrOrg = $orgAddrPosted;
                        } else {
                            $addrOrgErr = 'Длина адреса по нашему мнению не может превышать 255 символов! Если мы ошибаемся, - пожалуйста, напишите нам сообщение и отправьте его по электронной почте.';
                        }
                    } else {
                        $addrOrgErr = 'Пожалуйста, укажите корректный адрес на русском языке';
                    }  
                }  else {
                    $addrOrgErr = 'Поле обязательно для заполнения';
                }
            
                if (!empty($request->regorgtel)) {
                    $orgTelNumPosted = $request->regorgtel;
                    if(preg_match("#^(\+7)\s[\(][0-9]{3}[\)]\s[0-9]{3}-[0-9]{2}-[0-9]{2}$#", $orgTelNumPosted)) {
                        $orgTelNumPosted = $this->test_input($orgTelNumPosted);
                        // $telNumOrg = mysqli_real_escape_string($connect, $orgTelNumPosted);
                        $telNumOrg = $orgTelNumPosted;
                    } else {
                        $telNumOrgErr = 'Пожалуйста, укажите номер телефона в указанном формате.';
                    }  
                } else {
                    $telNumOrgErr = 'Поле обязательно для заполнения';
                }
               
                if (!empty($request->regorgemail)) {
                    $orgEmailPosted = strtolower($this->test_input($request->regorgemail));
                    if (preg_match("/^[A-Za-z0-9]+\_*\.?[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z0-9]+$/", $orgEmailPosted)) {
                        $orgEmailLogin = Login::where('email_addr', $orgEmailPosted);
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
    
            if(isset($request->orgneedsregularcontract) && isset($request->regsubbtn)) {
                if (!empty($_POST['contract_surname'])) {
                    $contrSurNamePosted = $_POST['contract_surname'];
                    if(preg_match("#^[а-яА-ЯёЁ\s'-]+$#u", $contrSurNamePosted)) {
                        $contrSurNamePosted = $this->test_input($contrSurNamePosted);
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
                        $contrNamePosted = $this->test_input($contrNamePosted);
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
                        $contrPatronNamePosted = $this->test_input($contrPatronNamePosted);
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
                        $contrPosOrgPosted = $this->test_input($contrPosOrgPosted);
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
                        $contrJustOrgPosted = $this->test_input($contrJustOrgPosted);
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
                        $bankaccOrgPosted = $this->test_input($bankaccOrgPosted);
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
                        $bicBankOrgPosted = $this->test_input($bicBankOrgPosted);
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
                        $contrAddInfoOrgted = $this->test_input($contrAddInfoOrgted);
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
            if(!empty($name) and !empty($surName) and !empty($persTelNum) and !empty($persEmail) and empty($persAddrErr)  
                and empty($dateOfBirthErr) and !empty($password) and empty($passwordErr) and empty($confirmErr) 
                and !empty($confirm) and !isset($_POST['org']) and !isset($_POST['orgneedsregularcontract'])) {

                if ($passwordPosted == $confirm) {
            
                    /* сейчас делаем такую модель:
                        - если для физлица заполнены имя, фамилия, телефон, email и не введены сомнительные данные (есть ошибки) в 
                        необязательные для заполнения поля: адрес, дата рождения ... 
                        1) сначала проверяем есть ли такой email в базе, если нет - записываем email в таблицу logins, получаем id 
                        2) заносим физлицо в таблицу users и получаем его id
                        3) обновляем таблицу logins: прописываем client_email_id
                    */
        
                    $newLogin = new Login;
                    $newLogin->email_addr = $persEmail;
                    $newLogin->email_client_type_id = 1;
                    $newLogin->save();
                    $persLoginId = $newLogin->id;
                
                    // Создаём новый объект класса Person
                    $newPerson = new Person;
                    $newPerson->pers_name = $name;
                    $newPerson->pers_surname = $surName;
                    $newPerson->pers_tel = $persTelNum;
                    $newPerson->pers_email = $persEmail;
                    $newPerson->pers_addr = $persAddr;
                    $newPerson->password = $password;
                    // $newPerson->salt = $salt;
                    // dd(strlen($salt));
                    if(!empty($dateOfBirth)) {$newPerson->date_of_birth = $dateOfBirth;}
                    $newPerson->pers_login_id = $persLoginId;
                    $newPerson->action_auth_id = 0;
                    $newPerson->save();
                    $idNewUser = $newPerson->id;   // вносим в БД новую запись и получаем id этой записи
                    
                    event(new Registered($newPerson));

                    // обновляем таблицу логинов:
                    $newPersonLogin = Login::where('id', $persLoginId)->first();
                    $newPersonLogin->email_client_id = $idNewUser;
                    $newPersonLogin->save();
        

                    // Через глобальный помощник «session» ...
                    session(['auth' => true]);                              // пометка об авторизации
                    session(['user_type' => '1', 'id' => $idNewUser]);
                    session()->flash('flash', "Добро пожаловать, $name!");  // с помощью метода flash сохраняем элемент в сессию только для следующего запроса. 
                    session(['user_status' => '1']);                        // пометка о статусе зарегистрированного пользователя 
                    session(['name' => $name]);
                    
                    // после регистрации абонента возвращаемся на страницу, с которой была заявка на регистрацию:
                    return redirect("$locationString");
    
                } else {
                    $confirmErr = 'Ведённые вами пароли не совпадают!';
                }
            } 
            
        }

        //dd($request);

        return view('components.register', [
            'name' => $name, 'nameErr' => $nameErr, 'surName' => $surName, 'surNameErr' => $surNameErr, 'persTelNum' => $persTelNum, 'persTelNumErr' => $persTelNumErr,
            'persEmail' => $persEmail, 'persEmailErr' => $persEmailErr, 'persAddr' => $persAddr, 'persAddrErr' => $persAddrErr, 'dateOfBirth' => $dateOfBirth, 'dateOfBirthErr' => $dateOfBirthErr,
            'password' => $password, 'passwordErr' => $passwordErr, 'confirm' => $confirm, 'confirmErr' => $confirmErr, 'nameOrg' => $nameOrg, 'nameOrgErr' => $nameOrgErr, 'innOrg' => $innOrg, 'innOrgErr' => $innOrgErr,
            'addrOrg' => $addrOrg, 'addrOrgErr' => $addrOrgErr, 'telNumOrg' => $telNumOrg, 'telNumOrgErr' => $telNumOrgErr, 'emailOrg' => $emailOrg, 'emailOrgErr' => $emailOrgErr,
            'contrSurNameOrg' => $contrSurNameOrg, 'contrSurNameOrgErr' => $contrSurNameOrgErr, 'contrNameOrg' => $contrNameOrg, 'contrNameOrgErr' => $contrNameOrgErr, 'contrPatronNameOrg' => $contrPatronNameOrg, 'contrPatronNameOrgErr' => $contrPatronNameOrgErr,
            'contrPosOrg' => $contrPosOrg, 'contrPosOrgErr' => $contrPosOrgErr, 'contrJustOrg' => $contrJustOrg, 'contrJustOrgErr' => $contrJustOrgErr, 'bankaccOrg' => $bankaccOrg, 'bankaccOrgErr' => $bankaccOrgErr,
            'bicBankOrg' => $bicBankOrg, 'bicBankOrgErr' => $bicBankOrgErr, 'contrAddInfoOrg' => $contrAddInfoOrg, 'contrAddInfoOrgErr' => $contrAddInfoOrgErr, 
            'locationString' => $locationString,
        ]);
    }
}
