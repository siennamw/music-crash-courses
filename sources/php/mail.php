<?php
if (isset($_POST['g-recaptcha-response']) && !empty($_POST['g-recaptcha-response'])):
    //your site secret key
    $secret = 'SECRET_KEY_HERE';
    //get verify response data
    $verifyResponse = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret=' . $secret . '&response=' . $_POST['g-recaptcha-response']);
    $responseData = json_decode($verifyResponse);
    if ($responseData->success):
        //contact form submission code
        $name = !empty($_POST['name']) ? $_POST['name'] : '';
        $email = !empty($_POST['email']) ? $_POST['email'] : '';
        $message = !empty($_POST['message']) ? $_POST['message'] : '';

        $to = 'EMAIL@DOMAIN.COM';
        $subject = 'EMAIL_SUBJECT';
        $htmlContent = "
                <p><b>Name: </b>" . $name . "</p>
                <p><b>Email: </b>" . $email . "</p>
                <p><b>Message: </b>" . $message . "</p>
            ";
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type: text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: '. $to . "\r\n" .
            'Reply-To: ' . $email . "\r\n" .
            'X-Mailer: PHP/' . phpversion();
        //send email
        $sent = @mail($to, $subject, $htmlContent, $headers);
        if ($sent):
            $result = "success";
        else:
            $result = "failure";
        endif;
    else:
        $result = "failure";
    endif;
else:
    $result = "failure";
endif;

if ($result == "success"):
    header('Location: DOMAIN/thanks.html');
elseif ($result == "failure"):
        header('Location: DOMAIN/sorry.html');
endif;
?>
