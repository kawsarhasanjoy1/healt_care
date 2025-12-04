import { Request, Response, NextFunction } from 'express';
import { DoctorSpecialtiesService } from './services.js';


const createDoctorSpecialty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
      const result = await DoctorSpecialtiesService.createDoctorSpecialty(
      req.body
    );

    res.status(201).json({
      success: true,
      message: 'Doctor specialty assigned successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const deleteDoctorSpecialty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { doctorId, specialtiesId } = req.query as {
      doctorId: string;
      specialtiesId: string;
    };

    const result = await DoctorSpecialtiesService.deleteDoctorSpecialty(
      doctorId,
      specialtiesId
    );

    res.status(200).json({
      success: true,
      message: 'Doctor specialty removed successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};


const getAllDoctorSpecialties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await DoctorSpecialtiesService.getAllDoctorSpecialties();

    res.status(200).json({
      success: true,
      message: 'All doctor-specialty relations fetched',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const DoctorSpecialtiesController = {
  createDoctorSpecialty,
  deleteDoctorSpecialty,
  getAllDoctorSpecialties,
};
