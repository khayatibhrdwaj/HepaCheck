from flask import Blueprint, render_template, request, redirect, url_for, flash

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register")
def register_select_role():
    # This page allows users to choose between patient and doctor registration
    return render_template("register/register_select_role.html")

@auth_bp.route("/register/patient", methods=["GET", "POST"])
def register_patient():
    prefill = {}
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        role = request.form.get("role") # Should be "patient"

        # Basic validation (add more robust validation as needed)
        if not all([username, email, password, role]):
            flash("All fields are required.", "error")
            prefill = request.form # Keep form data for re-rendering
            return render_template("register/register_patient.html", error="All fields are required.", prefill=prefill)

        # TODO: Add your user creation logic here for patients
        # Example: user = User(username=username, email=email, role=role)
        # user.set_password(password)
        # db.session.add(user)
        # db.session.commit()

        flash("Patient account created successfully!", "success")
        return redirect(url_for("auth.login")) # Redirect to login page

    return render_template("register/register_patient.html", prefill=prefill)

@auth_bp.route("/register/doctor", methods=["GET", "POST"])
def register_doctor():
    prefill = {}
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        role = request.form.get("role") # Should be "doctor"
        medical_licence = request.form.get("medical_licence")
        highest_degree = request.form.get("highest_degree")
        years_practicing = request.form.get("years_practicing")
        specialisation = request.form.get("specialisation")
        clinic_hospital = request.form.get("clinic_hospital")
        city = request.form.get("city")
        bio = request.form.get("bio")

        # Basic validation for doctor fields
        required_doctor_fields = [medical_licence, highest_degree, years_practicing, specialisation]
        if not all([username, email, password, role]) or not all(required_doctor_fields):
            flash("All required fields for doctor registration are required.", "error")
            prefill = request.form # Keep form data for re-rendering
            return render_template("register/register_doctor.html", error="All required fields for doctor registration are required.", prefill=prefill)

        # TODO: Add your user creation logic here for doctors
        # Example: doctor = Doctor(username=username, email=email, role=role,
        #                         medical_licence=medical_licence, highest_degree=highest_degree, ...)
        # doctor.set_password(password)
        # db.session.add(doctor)
        # db.session.commit()

        flash("Doctor account created successfully!", "success")
        return redirect(url_for("auth.login")) # Redirect to login page

    return render_template("register/register_doctor.html", prefill=prefill)