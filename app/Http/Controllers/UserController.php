<?php
    namespace App\Http\Controllers;

    class UserController extends Controller {
        
        // это тестовое задание из учебника:
        public function showcity($name) {
            try {
                $users = [
                    'user1' => 'city1',
                    'user2' => 'city2',
                    'user3' => 'city3',
                    'user4' => 'city4',
                    'user5' => 'city5',
                ];
                return view('user.showcity', [
                    'title' => 'user city',
                    'city' => $users[$name],
                ]);
            } catch (\Exception $error) {
                return view('user.showcity', [
                    'title' => 'user is not exists',
                    'city' => 'Юзера с таким именем не существует'
                ]);
            }
        }

    }