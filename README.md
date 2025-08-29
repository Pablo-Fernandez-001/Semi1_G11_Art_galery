# 📄 Manual Técnico de la Práctica 1: Art Gallery Cloud ⋆.ೃ࿔☁︎ ݁ ˖*༄

1. [Datos estudiantiles](#g11-datos-estudiantiles).

2. [Descripción de la aplicación](#descripción-de-la-aplicación).

3. [Descripción usuarios IAM](#descripción-usuarios-iam).
    * [IAM EC2](#descripción-de-componentes).
    * [IAM S3](#descripción-de-componentes).
    * [IAM RDS](#descripción-de-componentes).

4. [Anexos](#anexos).
    * [EC2](#glosario-de-términos).
    * [S3](#diagrama-entidad-relación-de-la-base-de-datos).
    * [RDS](#referencias).
    * [App Web](#descripción-de-componentes).
    * [Balanceador de tráfico](#balanceador-de-tráfico).


## G11 datos estudiantiles

| No. | Nombre | Carné |
| - | - | - |
| 1 | Miguel Angel Estrada Cifuentes | 201907884 |
| 2 | Karina Nohemi Ramírez Orellana | 201900957 |
| 3 | Joaquin Emmanuel Aldair Coromac Huezo | 201903873 |
| 4 | Pablo Daniel Fernández Chacón | 201807411 |
| 5 | Brian Alexander García Orr | 201807351 |

## Descripción de la aplicación
La aplicación se desarrolló con una arquitectura basada en **AWS Cloud**, utilizando los siguientes servicios:

- **Amazon EC2**: 2 instancias virtuales, una corriendo un backend en **Node.js** y la otra en **Python**.  
- **Amazon RDS**: Base de datos relacional para almacenar usuarios, obras y transacciones. Las imágenes no se guardan directamente, sino solo sus **URLs de S3**.  
- **Amazon S3**:  
  - Bucket para **página web estática** (`practica1-G#-paginaweb`).  
  - Bucket para **almacenamiento de imágenes** (`practica1-G#-imagenes`) con las carpetas:  
    - `Fotos_Perfil/`  
    - `Fotos_Publicadas/`  
- **Balanceador de Carga (ELB)**: Redirige tráfico a las instancias de EC2, garantizando disponibilidad si alguna instancia se apaga.  
- **IAM**: Usuarios con políticas específicas para restringir el acceso a los servicios según necesidad.

## Descripción usuarios IAM
Se configuraron usuarios con los siguientes permisos mínimos necesarios:

1. **Usuario IAM para S3**  
   - Permisos: `AmazonS3FullAccess`  
   - Uso: Administración de los buckets de imágenes y del sitio web estático.  

2. **Usuario IAM para EC2**  
   - Permisos: `AmazonEC2FullAccess`  
   - Uso: Administración de instancias EC2 donde corren los servidores.  

3. **Usuario IAM para RDS**  
   - Permisos: `AmazonRDSFullAccess`  
   - Uso: Creación, configuración y mantenimiento de la base de datos.  

> Todos los usuarios fueron configurados bajo el principio de **mínimo privilegio**, es decir, únicamente los permisos necesarios para su función.  

### ___IAM EC2___
![](/images/IAM_EC2.jpeg)

![](/images/IAM_EC2_1.jpeg)

![](/images/IAM_EC2_2.jpeg)

![](/images/IAM_EC2_3.jpeg)

![](/images/IAM_EC2_4.jpeg)

### ___IAM S3___
![](/images/IAM_S3.jpeg)

![](/images/IAM_S3_1.jpeg)

![](/images/IAM_S3_2.jpeg)

![](/images/IAM_S3_3.jpeg)

### ___IAM RDS___
![](/images/IAM_RDS.jpeg)

![](/images/IAM_RDS_1.jpeg)

![](/images/IAM_RDS_2.jpeg)

![](/images/IAM_RDS_3.jpeg)

## Anexos
### ___Virtual Machine EC2___

![alt text](/images/EC2_1.png)

![alt text](/images/EC2_2.png)

### ___Bucket S3___
![](/images/S3_buckets_practica1.png)

![](/images/S3_bucket_imagenes.png)

![](/images/S3_carpetaFotosPublicadas.png)

![](/images/S3_bucket_paginaweb.png)

![](/images/S3_configuracion_alojamiento_estatico.png)

![](/images/S3_politica_bucket_paginaweb.png)

### ___Data Base RDS___
![](/images/RDS_1.jpeg)

![](/images/RDS_2.jpeg)

![](/images/RDS_3.jpeg)

![](/images/RDS_4.jpeg)

![](/images/RDS_5.jpeg)

![](/images/RDS_6.jpeg)

![](/images/RDS_7.jpeg)

![](/images/RDS_8.jpeg)

![](/images/diagrama-db.jpg)

### ___Balanceador de tráfico___
![](/images/Balanceador_1.png)

![](/images/Balanceador_2.png)

![](/images/Balanceador_3.png)

### ___App Web___

Enlace de pagina web estatica alojada en S3
   http://practica1-g11-paginaweb--1.s3-website.us-east-2.amazonaws.com/

![](/images/appWeb_login.png)

![](/images/appWeb_perfil.png)

![](/images/appWeb_registro.png)

![](/images/appWeb_galeria.png)

![](/images/appWeb_editarPerfil.png)

![](/images/appWeb_obrasAdquiridas.png)

![](/images/appWeb_addSaldo.png)