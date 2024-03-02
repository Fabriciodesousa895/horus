BEGIN
  DECLARE
   V_COUNT INT(10) := 1;
   V_COUNT2 INT(10) := 10;
   V_COUNT3  INT(10) := 0;
   V_CPF INT(11) := 12161039091;
   BEGIN   
       FOR I IN 1..8 LOOP
         V_COUNT := V_COUNT + 1;
         V_COUNT2 := V_COUNT2 - 1;
         V_COUNT3 :=  V_COUNT3 +  SUBSTR(V_CPF,V_COUNT,1 ) *  V_COUNT2;
        END LOOP;
        V_COUNT3 := MOD(((V_COUNT3 + SUBSTR(V_CPF,0,1 ) * 10) * 10),11) ;
        IF V_COUNT3 NOT IN (SUBSTR(V_CPF,10,1),0) THEN
            DBMS_OUTPUT.PUT_LINE(TO_CHAR('Não é um cpf válido'));
        ELSE 
           DBMS_OUTPUT.PUT_LINE(TO_CHAR('É UM CPF VÁLIDO'));
        END IF;
  END;
END;
