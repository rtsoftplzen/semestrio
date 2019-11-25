<?php

// 1. Konfigurace pomocí konstant
define('LOGIN', 'login');
define('PASS',  'password');

// 2. Konfigurace pomocí pole v inicializačním scriptu
$config = [

    'LOGIN' => 'login',
    'PASS'  => 'password',
];

global $config;

// 3. Konfigurace pomocí třídy
class SampleConfig
{
    const LOGIN = 'login';
    const PASS  = 'password';
}
